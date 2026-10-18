import {
  COLOR_CLASSES, GRAIN_FILTER, GRAIN_LAYER, STROKE_CLASSES,
  circlePath, pickPosition, point, round, starPath,
} from './helpers.js'

// Tema "graffiti / streetwear": rabiscos grossos de spray com contorno,
// tinta escorrendo e respingos.
// Variantes sorteadas:
//   parede → tijolos OU concreto (com textura de grão)
//   extras → coroa, setas, estrelas, "X", adesivos redondos
export function graffiti(rand, { intensity, softness, textArea }) {
  const totalTags = 2 + Math.round(intensity * 3)
  const wall = rand.pick(['bricks', 'concrete'])

  let haze = ''
  let tags = ''
  for (let i = 0; i < totalTags; i++) {
    const center = pickPosition(rand, textArea)
    const colorIndex = rand.int(0, 2)
    // "nuvem" de spray atrás do rabisco
    haze += `<circle cx="${Math.round(center[0])}" cy="${Math.round(center[1])}" r="${Math.round(rand.range(180, 300))}" class="${COLOR_CLASSES[colorIndex]}" opacity="0.3"/>`
    tags += tag(rand, center, STROKE_CLASSES[colorIndex])
  }

  let splatters = ''
  for (let i = 2 + Math.round(intensity * 4); i > 0; i--) {
    splatters += splatter(rand, pickPosition(rand, textArea))
  }

  // Alguns "desenhos" extras: cada um tem sua chance de aparecer.
  let extras = ''
  for (const draw of [crown, arrow, stars, crosses, stickers]) {
    if (rand.chance(0.45)) extras += draw(rand, pickPosition(rand, textArea))
  }

  return {
    defs:
      (wall === 'bricks' ? brickPattern() : GRAIN_FILTER) +
      `<filter id="wt-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(30 + softness * 50)}"/></filter>`,
    body:
      (wall === 'bricks' ? `<rect width="100%" height="100%" fill="url(#wt-bricks)"/>` : GRAIN_LAYER) +
      `<g filter="url(#wt-blur)">${haze}</g>` +
      `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${tags}</g>` +
      extras +
      splatters,
  }
}

// Tijolos: duas fileiras por azulejo, a segunda deslocada meio tijolo.
function brickPattern() {
  return (
    `<pattern id="wt-bricks" width="160" height="80" patternUnits="userSpaceOnUse">` +
    `<path d="M0,1H160M0,41H160M1,0V40M81,40V80" class="wt-stroke-shade" stroke-width="3" opacity="0.5" fill="none"/>` +
    `</pattern>`
  )
}

// Um rabisco: curva grossa passando por pontos sorteados, com contorno e escorridos.
function tag(rand, [cx, cy], color) {
  const points = []
  const total = rand.int(5, 9)
  const width = rand.range(380, 620)
  for (let i = 0; i < total; i++) {
    // Sobe e desce alternado, como as letras de uma assinatura.
    const side = i % 2 === 0 ? 1 : -1
    const x = cx - width / 2 + (width / (total - 1)) * i + rand.range(-25, 25)
    points.push([x, cy + side * rand.range(40, 130)])
  }
  const d = smoothOpenPath(points)
  const thickness = rand.int(30, 48)

  // tinta escorrendo de alguns pontos do rabisco
  let drips = ''
  for (const [x, y] of points) {
    if (!rand.chance(0.45)) continue
    drips += `M${Math.round(x)},${Math.round(y)}v${Math.round(rand.range(40, 190))}`
  }

  return (
    `<path d="${d}" class="wt-stroke-shade" stroke-width="${thickness + 14}"/>` +
    `<path d="${d}" class="${color}" stroke-width="${thickness}"/>` +
    `<path d="${drips}" class="${color}" stroke-width="${Math.round(thickness / 3)}"/>`
  )
}

// Respingos: bolinhas espalhadas em volta de um ponto (mais juntas no meio).
function splatter(rand, [cx, cy]) {
  let d = ''
  for (let i = rand.int(15, 30); i > 0; i--) {
    const angle = rand.range(0, Math.PI * 2)
    const distance = rand.next() ** 2 * 140
    d += circlePath(cx + Math.cos(angle) * distance, cy + Math.sin(angle) * distance, rand.range(2, 12))
  }
  return `<path d="${d}" class="${rand.pick(COLOR_CLASSES)}"/>`
}

// Coroa de três pontas com bolinhas (clássico do graffiti).
function crown(rand, [x, y]) {
  const s = rand.range(0.8, 1.4)
  const p = (dx, dy) => `${Math.round(x + dx * s)},${Math.round(y + dy * s)}`
  const d = `M${p(-90, 40)}L${p(-110, -50)}L${p(-45, 0)}L${p(0, -80)}L${p(45, 0)}L${p(110, -50)}L${p(90, 40)}Z`
  const balls = circlePath(x - 110 * s, y - 62 * s, 14 * s) + circlePath(x, y - 94 * s, 14 * s) + circlePath(x + 110 * s, y - 62 * s, 14 * s)
  return `<path d="${d}${balls}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="8" stroke-linejoin="round"/>`
}

// Seta curva com ponta triangular.
function arrow(rand, [x, y]) {
  const s = rand.range(0.8, 1.3)
  const angle = rand.int(0, 359)
  return (
    `<g transform="translate(${Math.round(x)} ${Math.round(y)}) rotate(${angle}) scale(${round(s)})">` +
    `<path d="M-140,40Q-40,-80 80,-10" fill="none" class="wt-stroke-shade" stroke-width="40" stroke-linecap="round"/>` +
    `<path d="M-140,40Q-40,-80 80,-10" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="26" stroke-linecap="round"/>` +
    `<path d="M60,-60L150,10L50,45Z" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="7" stroke-linejoin="round"/></g>`
  )
}

function stars(rand, [x, y]) {
  let d = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    d += starPath(x + rand.range(-150, 150), y + rand.range(-100, 100), rand.range(20, 45))
  }
  return `<path d="${d}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="5" stroke-linejoin="round"/>`
}

// "X" pintados com spray.
function crosses(rand, [x, y]) {
  let d = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    const cx = x + rand.range(-160, 160)
    const cy = y + rand.range(-100, 100)
    const s = rand.range(18, 32)
    d += `M${Math.round(cx - s)},${Math.round(cy - s)}L${Math.round(cx + s)},${Math.round(cy + s)}M${Math.round(cx + s)},${Math.round(cy - s)}L${Math.round(cx - s)},${Math.round(cy + s)}`
  }
  return `<path d="${d}" class="${rand.pick(STROKE_CLASSES)}" stroke-width="12" stroke-linecap="round"/>`
}

// Adesivos redondos colados no muro.
function stickers(rand, [x, y]) {
  let result = ''
  for (let i = rand.int(1, 3); i > 0; i--) {
    const cx = x + rand.range(-150, 150)
    const cy = y + rand.range(-120, 120)
    const r = rand.range(35, 60)
    result +=
      `<path d="${circlePath(cx, cy, r)}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
      `<path d="${circlePath(cx, cy, r * 0.55)}" fill="none" class="wt-stroke-bg" stroke-width="6"/>`
  }
  return result
}

// Curva suave que passa por todos os pontos, sem fechar (Catmull-Rom → Bézier).
function smoothOpenPath(points) {
  let d = `M${point(points[0])}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(i + 2, points.length - 1)]
    const control1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const control2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${point(control1)} ${point(control2)} ${point(p2)}`
  }
  return d
}
