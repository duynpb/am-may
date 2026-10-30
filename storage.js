// Lưu trữ lâu dài cho máy chủ: hồ sơ Phật tử + vài giá trị chung (sổ công đức).
// Có DATABASE_URL → dùng Postgres (Neon, Supabase…); không có → ghi file JSON trong thư mục data/.
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';

export async function openStorage({ dataDir }) {
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      return await openPostgres(url);
    } catch (e) {
      console.error('Không kết nối được cơ sở dữ liệu, tạm dùng file:', e.message);
    }
  }
  return openFile(dataDir);
}

async function openPostgres(url) {
  const { default: pg } = await import('pg');
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const pool = new pg.Pool({
    connectionString: url,
    ssl: local || process.env.PGSSL === 'off' ? false : { rejectUnauthorized: process.env.PGSSL !== 'no-verify' },
    max: 4,
  });
  pool.on('error', (e) => console.error('Lỗi cơ sở dữ liệu:', e.message));
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      uid text PRIMARY KEY,
      data jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS kv (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  return {
    kind: 'postgres',
    async loadProfiles() {
      const { rows } = await pool.query('SELECT uid, data FROM profiles');
      return new Map(rows.map((r) => [r.uid, r.data]));
    },
    // entries: [[uid, profile], …] — ghi một lượt
    async saveProfiles(entries) {
      if (!entries.length) return;
      await pool.query(
        `INSERT INTO profiles (uid, data)
         SELECT u, d FROM unnest($1::text[], $2::jsonb[]) AS t(u, d)
         ON CONFLICT (uid) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [entries.map(([uid]) => uid), entries.map(([, p]) => JSON.stringify(p))],
      );
    },
    async loadKV(key) {
      const { rows } = await pool.query('SELECT value FROM kv WHERE key = $1', [key]);
      return rows[0]?.value ?? null;
    },
    async saveKV(key, value) {
      await pool.query(
        `INSERT INTO kv (key, value) VALUES ($1, $2::jsonb)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, JSON.stringify(value)],
      );
    },
    close: () => pool.end(),
  };
}

function openFile(dataDir) {
  const file = (name) => path.join(dataDir, name);
  const read = (name, fallback) => {
    try {
      return JSON.parse(readFileSync(file(name), 'utf8'));
    } catch {
      return fallback;
    }
  };
  const write = (name, value) => {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(file(name) + '.tmp', JSON.stringify(value));
    renameSync(file(name) + '.tmp', file(name));
  };
  let all = null;
  return {
    kind: 'file',
    async loadProfiles() {
      all = read('profiles.json', {});
      return new Map(Object.entries(all));
    },
    async saveProfiles(entries) {
      if (!entries.length) return;
      all ??= read('profiles.json', {});
      for (const [uid, p] of entries) all[uid] = p;
      write('profiles.json', all);
    },
    async loadKV(key) {
      return read('kv.json', {})[key] ?? null;
    },
    async saveKV(key, value) {
      const kv = read('kv.json', {});
      kv[key] = value;
      write('kv.json', kv);
    },
    close: async () => {},
  };
}
