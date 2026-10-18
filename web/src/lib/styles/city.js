import { HEIGHT, WIDTH, circlePath, cloudPath, skyPosition } from './helpers.js'

const HORIZON = HEIGHT * 0.72

// Tema "cidade cyberpunk": prédios com janelas acesas na frente de um céu colorido.
// Variantes sorteadas:
//   céu  → noite (tema escuro): sol neon listrado OU lua crescente com estrelas
//          dia (tema claro): sol neon listrado com nuvens
//   chão → quadriculado em perspectiva OU água refletindo a cidade
//   extras → letreiros neon, carros voadores, chuva
export function city(rand, { intensity, softness, textArea, theme }) {
  // Sorteador próprio para o céu: trocar o tema não mexe nos prédios.
  const celestialRand = rand.fork()
  const [skyX, skyY] = skyPosition(rand, textArea)
  const useSun = theme === 'light' || celestialRand.chance(0.5)
  const useWater = rand.chance(0.4)
  const skyline = buildings(rand, intensity)

  const ground = useWater
    ? // a água é a própria cidade de cabeça para baixo, mais apagada
      `<rect y="${Math.round(HORIZON)}" width="${WIDTH}" height="${Math.round(HEIGHT - HORIZON)}" class="wt-fill-bg"/>` +
      `<g transform="translate(0 ${Math.round(HORIZON * 2)}) scale(1 -1)" opacity="0.3">${skyline.svg}</g>` +
      waterRipples(rand)
    : floorGrid()

  return {
    defs:
      skyGradient() +
      glowFilter(softness) +
      windowPattern(rand, intensity) +
      (useSun ? sunDefs(skyX) : ''),
    body:
      `<rect width="${WIDTH}" height="${Math.round(HORIZON)}" fill="url(#wt-sky)"/>` +
      (useSun ? sun(skyX) : moonAndStars(celestialRand, skyX, skyY)) +
      (theme === 'light' ? dayClouds(celestialRand) : '') +
      (rand.chance(0.5) ? flyingCars(rand) : '') +
      skyline.svg +
      (rand.chance(0.6) ? billboards(rand, skyline.tops) : '') +
      ground +
      (rand.chance(0.3) ? rain(rand) : ''),
  }
}

// Céu: escuro em cima e bem iluminado perto do horizonte,
// para os prédios aparecerem como silhuetas contra a luz.
function skyGradient() {
  return (
    `<linearGradient id="wt-sky" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" class="wt-stop-bg" stop-opacity="0"/>` +
    `<stop offset="0.55" class="wt-stop-c3" stop-opacity="0.35"/>` +
    `<stop offset="1" class="wt-stop-c1" stop-opacity="0.85"/>` +
    `</linearGradient>`
  )
}

function glowFilter(softness) {
  return (
    `<filter id="wt-glow" x="-30%" y="-30%" width="160%" height="160%">` +
    `<feGaussianBlur stdDeviation="${Math.round(4 + softness * 26)}" result="glow"/>` +
    `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
  )
}

// Sol com degradê e listras recortadas por uma máscara.
const SUN_RADIUS = 250
function sunDefs(sunX) {
  const cy = HORIZON - SUN_RADIUS * 0.35
  let stripes = ''
  for (let i = 0; i < 6; i++) {
    stripes += `<rect y="${Math.round(cy + i * SUN_RADIUS * 0.16)}" width="${WIDTH}" height="${4 + i * 4}" fill="black"/>`
  }
  return (
    `<linearGradient id="wt-sun" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" class="wt-stop-c2"/><stop offset="1" class="wt-stop-c1"/></linearGradient>` +
    `<mask id="wt-sun-stripes"><rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>${stripes}</mask>`
  )
}

function sun(sunX) {
  return (
    `<g mask="url(#wt-sun-stripes)" filter="url(#wt-glow)">` +
    `<circle cx="${Math.round(sunX)}" cy="${Math.round(HORIZON - SUN_RADIUS * 0.35)}" r="${SUN_RADIUS}" fill="url(#wt-sun)"/></g>`
  )
}

// Lua crescente (um círculo "mordido" por outro da cor do fundo) e estrelas.
function moonAndStars(rand, x, y) {
  const r = rand.range(60, 100)
  let stars = ''
  for (let i = rand.int(20, 45); i > 0; i--) {
    stars += circlePath(rand.range(0, WIDTH), rand.range(0, HORIZON * 0.7), rand.range(1.5, 3.5))
  }
  return (
    `<path d="${stars}" class="wt-fill-detail" opacity="0.8"/>` +
    `<g filter="url(#wt-glow)"><path d="${circlePath(x, y, r)}" class="wt-fill-detail"/></g>` +
    `<path d="${circlePath(x + r * 0.4, y - r * 0.25, r * 0.85)}" class="wt-fill-bg"/>`
  )
}

// Nuvens de dia, passando no alto do céu.
function dayClouds(rand) {
  let d = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    d += cloudPath(rand.range(0, WIDTH - 300), rand.range(HEIGHT * 0.1, HEIGHT * 0.35), rand.range(180, 320))
  }
  return `<path d="${d}" class="wt-fill-c2" opacity="0.5"/>`
}

// Um "azulejo" de janelas que se repete por todos os prédios da frente.
function windowPattern(rand, intensity) {
  const litChance = 0.2 + intensity * 0.3
  let windows = ''
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      if (!rand.chance(litChance)) continue
      const color = rand.chance(0.7) ? 'wt-fill-c2' : 'wt-fill-c1'
      windows += `<rect x="${8 + col * 20}" y="${10 + row * 24}" width="10" height="14" class="${color}"/>`
    }
  }
  return `<pattern id="wt-windows" width="60" height="96" patternUnits="userSpaceOnUse">${windows}</pattern>`
}

// Três fileiras de prédios: a de trás mais apagada, a da frente com janelas.
// Devolve o SVG e o topo dos prédios da frente (para pendurar letreiros).
function buildings(rand, intensity) {
  // A fileira de trás usa uma cor da paleta (fica "no meio da névoa");
  // as da frente são silhuetas escuras.
  const layers = [
    { minHeight: 260, maxHeight: 560, color: 'wt-fill-c3', opacity: 0.5, windows: false },
    { minHeight: 160, maxHeight: 420, color: 'wt-fill-shade', opacity: 0.85, windows: true },
    { minHeight: 90, maxHeight: 280, color: 'wt-fill-shade', opacity: 1, windows: true },
  ]

  let svg = ''
  const tops = []
  for (const layer of layers) {
    let shapes = ''
    let lit = ''
    let x = rand.range(-120, -20)
    while (x < WIDTH) {
      const width = rand.range(60, 170)
      const height = rand.range(layer.minHeight, layer.maxHeight) * (0.7 + intensity * 0.5)
      const top = HORIZON - height
      const rect = `x="${Math.round(x)}" y="${Math.round(top)}" width="${Math.round(width)}" height="${Math.round(height)}"`
      shapes += `<rect ${rect}/>`
      if (layer.windows) lit += `<rect ${rect}/>`
      if (layer.opacity === 1) tops.push({ x, width, top })

      // Topo do prédio: antena com luz, telhado em ponta ou nada.
      const roof = rand.pick(['antenna', 'spire', 'flat', 'flat'])
      const middle = Math.round(x + width / 2)
      if (roof === 'antenna' && height > layer.maxHeight * 0.6) {
        shapes += `<rect x="${middle - 2}" y="${Math.round(top - 70)}" width="4" height="70"/>`
        lit += `<circle cx="${middle}" cy="${Math.round(top - 72)}" r="6" class="wt-fill-c1"/>`
      } else if (roof === 'spire') {
        shapes += `<path d="M${Math.round(x)},${Math.round(top)}L${middle},${Math.round(top - width * 0.6)}L${Math.round(x + width)},${Math.round(top)}Z"/>`
      }
      x += width + rand.range(0, 18)
    }
    svg += `<g class="${layer.color}" opacity="${layer.opacity}">${shapes}</g>`
    if (lit) svg += `<g fill="url(#wt-windows)">${lit}</g>`
  }
  return { svg, tops }
}

// Letreiros de neon pendurados na lateral de alguns prédios da frente.
function billboards(rand, tops) {
  let result = ''
  for (let i = rand.int(1, 3); i > 0; i--) {
    const building = rand.pick(tops)
    const width = Math.max(50, building.width * 0.7)
    const height = rand.range(40, 70)
    const x = building.x + (building.width - width) / 2
    const y = building.top + rand.range(20, 60)
    result += `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="${Math.round(height)}" rx="8" class="wt-fill-shade ${rand.pick(['wt-stroke-c1', 'wt-stroke-c2'])}" stroke-width="5"/>`
  }
  return `<g filter="url(#wt-glow)">${result}</g>`
}

// Carros voadores: tracinhos de luz no céu.
function flyingCars(rand) {
  let d = ''
  for (let i = rand.int(3, 7); i > 0; i--) {
    const x = rand.range(0, WIDTH)
    const y = rand.range(HORIZON * 0.35, HORIZON * 0.8)
    d += `M${Math.round(x)},${Math.round(y)}h${Math.round(rand.range(30, 90))}`
  }
  return `<path d="${d}" class="wt-stroke-c2" stroke-width="5" stroke-linecap="round" filter="url(#wt-glow)"/>`
}

// Chão quadriculado: linhas horizontais cada vez mais juntas no horizonte
// e linhas que "fogem" para um ponto no meio do horizonte.
function floorGrid() {
  let d = ''
  for (let i = 1; i <= 9; i++) {
    const y = HORIZON + (HEIGHT - HORIZON) * (i / 9) ** 2
    d += `M0,${Math.round(y)}H${WIDTH}`
  }
  for (let i = -12; i <= 12; i++) {
    d += `M${WIDTH / 2},${Math.round(HORIZON)}L${Math.round(WIDTH / 2 + i * 220)},${HEIGHT}`
  }
  return (
    `<rect y="${Math.round(HORIZON)}" width="${WIDTH}" height="${Math.round(HEIGHT - HORIZON)}" class="wt-fill-bg"/>` +
    `<path d="${d}" fill="none" class="wt-stroke-c1" stroke-width="2" opacity="0.6"/>`
  )
}

// Marolas na água: tracinhos horizontais.
function waterRipples(rand) {
  let d = ''
  for (let i = 0; i < 40; i++) {
    const y = rand.range(HORIZON + 10, HEIGHT)
    d += `M${Math.round(rand.range(0, WIDTH))},${Math.round(y)}h${Math.round(rand.range(40, 160))}`
  }
  return `<path d="${d}" class="wt-stroke-c1" stroke-width="3" stroke-linecap="round" opacity="0.4"/>`
}

// Chuva: risquinhos inclinados por toda a tela.
function rain(rand) {
  let d = ''
  for (let i = 0; i < 90; i++) {
    d += `M${Math.round(rand.range(0, WIDTH))},${Math.round(rand.range(0, HEIGHT))}l-12,40`
  }
  return `<path d="${d}" class="wt-stroke-detail" stroke-width="2" opacity="0.35"/>`
}
