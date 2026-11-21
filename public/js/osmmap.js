// Bản đồ chi tiết OpenStreetMap cho khung "Bản đồ Việt Nam": nền ảnh bản đồ của OpenStreetMap, chấm chùa đặt theo toạ độ.
// Thư viện Leaflet 1.9.4 nằm ngay trong trang (public/vendor/leaflet, đúng bản chính thức); chỉ ảnh nền bản đồ tải từ tile.openstreetmap.org
// và chỉ tải khi người dùng bấm "Bản đồ chi tiết". Dữ liệu bản đồ © những người đóng góp OpenStreetMap (ODbL).
let leafletPromise = null;
function loadLeaflet() {
  leafletPromise ??= new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/vendor/leaflet/leaflet.css';
    document.head.append(css);
    const s = document.createElement('script');
    s.src = '/vendor/leaflet/leaflet.js';
    s.onload = () => resolve(window.L);
    s.onerror = () => { leafletPromise = null; reject(new Error('Không nạp được thư viện bản đồ')); };
    document.head.append(s);
  });
  return leafletPromise;
}

export async function createOsm(box, pagodas, { here, onPick }) {
  const L = await loadLeaflet();
  const map = L.map(box, { renderer: L.canvas(), minZoom: 5, maxZoom: 19, zoomSnap: 0.5, worldCopyJump: false, maxBounds: [[2, 95], [28, 122]], maxBoundsViscosity: 0.8 });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  map.fitBounds([[8.2, 102.0], [23.5, 110.2]]);
  const markers = new Map();
  const labels = L.layerGroup();
  const order = [...pagodas.filter((p) => !p.built), ...pagodas.filter((p) => p.built)];
  let selected = null;
  const style = (p, sel) => ({
    radius: p.built ? 8 : 5.5, color: sel ? '#222' : '#ffffff', weight: sel ? 3 : 2, fillColor: p.built ? '#c0392b' : '#8a5a2a', fillOpacity: 1,
  });
  for (const p of order) {
    const m = L.circleMarker([p.lat, p.lon], style(p, p.id === here)).addTo(map);
    m.bindTooltip(`${p.name} — ${p.prov}`, { direction: 'top', offset: [0, -6] });
    m.on('click', () => onPick(p));
    markers.set(p.id, m);
    const el = document.createElement('span');
    el.textContent = p.name;
    L.marker([p.lat, p.lon], { icon: L.divIcon({ className: 'vn-osm-label' + (p.built ? ' built' : ''), html: el, iconSize: null, iconAnchor: [-9, 9] }), interactive: false, keyboard: false }).addTo(labels);
  }
  const syncLabels = () => {
    const z = map.getZoom();
    if (z >= 10 && !map.hasLayer(labels)) labels.addTo(map);
    else if (z < 10 && map.hasLayer(labels)) map.removeLayer(labels);
  };
  map.on('zoomend', syncLabels);
  syncLabels();
  return {
    // gọi khi khung vừa hiện ra (có kích thước thật)
    show() { map.invalidateSize(); },
    select(p, { zoom = 0 } = {}) {
      if (selected) markers.get(selected.id)?.setStyle(style(selected, selected.id === here));
      selected = p;
      const m = markers.get(p.id);
      m?.setStyle(style(p, true));
      m?.bringToFront();
      if (zoom) map.flyTo([p.lat, p.lon], zoom, { duration: 0.8 });
      else map.panTo([p.lat, p.lon]);
    },
  };
}
