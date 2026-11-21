// Chùa Linh Ứng Bà Nà và đỉnh Bà Nà quanh chùa: Làng Pháp, vườn hoa Le Jardin d'Amour, đường lên Cầu Vàng, Cầu Vàng đi bộ được
// (hai bàn tay đá lấy từ mẫu SketchUp), đài ngắm và ga cáp treo ở đầu cầu bên kia. Phần đỉnh núi nằm trong bana-summit.js.
import { makeYardSite } from './yard.js';
import { bigBuddha } from './yard-extras.js';
import * as SUM from './bana-summit.js';

const base = makeYardSite({
  id: 'linhunbana',
  name: 'Chùa Linh Ứng Bà Nà',
  plaque: 'LINH ỨNG BÀ NÀ TỰ',
  front: 'none',
  slots: { L: 'custom', R: 'bell', RL: 'stupa' },
  wall: '#efe0b8',
  ground: '#8a9a6a',
  sky: ['#7fbbe6', '#f1efe2'],
  hill: { h: 34, color: '#5f8a48' },
  trees: 'pine',
  loading: 'Nắng sớm đang lên trên núi Bà Nà',
  hint: 'ngắm tượng Phật lớn, ra cổng đông qua Làng Pháp và vườn hoa, lên con đường dốc rồi đi bộ trên Cầu Vàng',
  info: 'Chùa Linh Ứng Bà Nà ở Đà Nẵng nằm trên núi Bà Nà giữa mây và rừng, nổi tiếng với tượng Phật Thích Ca lớn màu trắng trên đài sen cao. Trong chùa có sân rộng, gác chuông, tháp nhỏ và chánh điện. Ra cổng đông là quảng trường Làng Pháp với tháp đồng hồ và nhà thờ, phía bắc là vườn hoa Le Jardin d’Amour có giàn hoa vòm và đài phun nước Apollo; từ quảng trường có đường dốc lên chân Cầu Vàng. Cầu Vàng uốn cong nằm trên hai bàn tay đá khổng lồ, đi bộ được; đầu cầu bên kia có đài ngắm và ga cáp treo. (Dựng phỏng theo không khí, không phải bản sao.)',
  tips: [
    ['Ra Cầu Vàng', 'Từ sân chùa đi ra cổng đông (bên phải), qua quảng trường Làng Pháp rồi theo con đường dốc lên chân Cầu Vàng; đi bộ trên cầu tới giữa cầu để xem hai bàn tay đá.'],
    ['Vườn hoa', 'Ở quảng trường Làng Pháp, đi lối giữa hai dãy nhà phía bắc để vào vườn hoa Le Jardin d’Amour.'],
    ['Thắp nhang', 'Trong chánh điện thì thắp trước bàn thờ; ngoài sân thì ở lư hương đá giữa sân.'],
  ],
  says: ['Nam mô A Di Đà Phật', 'Mây bay dưới chân', 'Bà Nà mát quá', 'Cầu Vàng đẹp quá', 'Làng Pháp trên núi thơ mộng'],
  custom: { L: { name: 'Tượng Phật Thích Ca lớn', label: 'Tượng Phật lớn', r: 5.3 } },
  eastGate: { z: -4.1, w: 7.2 },
  hillClips: [{ x0: 28, x1: 450, z0: -150, z1: 90, floor: (x, z) => SUM.groundY(x, z) }], // bỏ phần đồi nền che khu phía đông
  treeFilter: (x, z) => !(x > 29 && z > -100 && z < 45), // chừa chỗ cho quảng trường, vườn hoa và đường dốc phía đông
  extras: (ctx) => { bigBuddha(ctx, 'L'); SUM.buildSummit(ctx); },
});

base.ROUND_OBSTACLES.push(...SUM.OBSTACLES);

export const SITE = {
  ...base,
  WALK_AREAS: [...base.WALK_AREAS, ...SUM.WALK],
  groundY: (x, z) => (x > 26 ? SUM.groundY(x, z) : base.groundY(x, z)),
  camFloor: (x, z) => Math.max(base.camFloor(x, z), SUM.groundY(x, z)),
  PLACES: [...base.PLACES, ...SUM.PLACES],
  MAP: { ...base.MAP, box: [-34, -100, SUM.E.x + 60, 175], font: 8, shapes: [...base.MAP.shapes, ...SUM.MAP_SHAPES], labels: [...base.MAP.labels, ...SUM.MAP_LABELS] },
  OV: { bounds: { x0: -34, x1: SUM.E.x + 50, z0: -110, z1: 56 }, dist: 300 },
  TRIPS: [...base.TRIPS, ...SUM.TRIPS],
  BOT_SPAWN: [...base.BOT_SPAWN, ...SUM.BOT_SPAWN],
};
