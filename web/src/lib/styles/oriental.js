import { HEIGHT, WIDTH, circlePath, pickPosition, round, skyPosition } from './helpers.js'

const SEA_TOP = HEIGHT * 0.74

// Tema "oriental": sol grande e mar com o padrão japonês de ondas (seigaiha).
// Variantes sorteadas:
//   paisagem → monte com neve (estilo Fuji), portal torii ou pagode
//   extras   → nuvens, pétalas de sakura, lanternas, bambus, pássaros
export function oriental(rand, { intensity, softness, textArea }) {
  const [sunX, sunY] = skyPosition(rand, textArea)
  const sunRadius = rand.range(110, 170)
  const landmarkX = textArea === 'center' ? rand.pick([0.2, 0.8]) * WIDTH : rand.range(0.62, 0.8) * WIDTH
  const landmark = rand.pick([mountain, mountain, torii, pagoda])
  // O bambu fica do lado oposto ao monumento, para não amontoar.
  const bambooX = landmarkX < WIDTH / 2 ? WIDTH * 0.93 : WIDTH * 0.07

  return {
    defs:
      seigaihaPattern() +
      `<filter id="wt-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(10 + softness * 30)}"/></filter>`,
    body:
      `<path d="${circlePath(sunX, sunY, sunRadius)}" class="wt-fill-c1" opacity="0.5" filter="url(#wt-blur)"/>` +
      `<path d="${circlePath(sunX, sunY, sunRadius)}" class="wt-fill-c1"/>` +
      (rand.chance(0.7) ? clouds(rand) : '') +
      (rand.chance(0.35) ? cranes(rand, textArea) : '') +
      landmark(rand, landmarkX) +
      `<rect y="${Math.round(SEA_TOP)}" width="${WIDTH}" height="${Math.round(HEIGHT - SEA_TOP)}" class="wt-fill-bg"/>` +
      `<rect y="${Math.round(SEA_TOP)}" width="${WIDTH}" height="${Math.round(HEIGHT - SEA_TOP)}" fill="url(#wt-seigaiha)" opacity="${round(0.35 + intensity * 0.4)}"/>` +
      (textArea === 'left' && rand.chance(0.4) ? bamboo(rand, bambooX) : '') +
      (rand.chance(0.4) ? lanterns(rand, textArea) : '') +
      (rand.chance(0.75) ? petals(rand, intensity, textArea) : ''),
  }
}

// Seigaiha: "escamas" de arcos, uma fileira por cima da outra.
// O azulejo de 100×50 tem escamas em 3 alturas (0, 25 e 50); a ordem importa,
// porque cada fileira de baixo cobre um pedaço da de cima.
function seigaihaPattern() {
  const centers = [[0, 0], [100, 0], [50, 25], [0, 50], [100, 50]]
  let scales = ''
  for (const [x, y] of centers) {
    for (const radius of [50, 37, 24, 11]) {
      scales += `<circle cx="${x}" cy="${y}" r="${radius}"/>`
    }
  }
  return (
    `<pattern id="wt-seigaiha" width="100" height="50" patternUnits="userSpaceOnUse">` +
    `<g class="wt-fill-bg wt-stroke-c1" stroke-width="3">${scales}</g></pattern>`
  )
}

// O monte: laterais côncavas, topo achatado e uma "touca" de neve.
function mountain(rand, peakX) {
  const x = Math.round(peakX)
  const top = Math.round(HEIGHT * rand.range(0.3, 0.4))
  const base = Math.round(SEA_TOP + 10)
  const half = 720

  const body =
    `M${x - half},${base}C${x - half * 0.5},${base - 30} ${x - half * 0.2},${top + 60} ${x - 50},${top}` +
    `L${x + 50},${top}C${x + half * 0.2},${top + 60} ${x + half * 0.5},${base - 30} ${x + half},${base}Z`
  const snow =
    `M${x - 50},${top}L${x + 50},${top}L${x + 120},${top + 110}L${x + 70},${top + 90}L${x + 35},${top + 125}` +
    `L${x - 5},${top + 95}L${x - 55},${top + 130}L${x - 120},${top + 110}Z`

  return `<path d="${body}" class="wt-fill-shade"/><path d="${snow}" class="wt-fill-c2" opacity="0.9"/>`
}

// Portal torii dentro da água: dois pilares e duas vigas (a de cima curvada).
function torii(rand, centerX) {
  const x = Math.round(centerX)
  const ground = Math.round(SEA_TOP + 60)
  const s = rand.range(0.9, 1.2) // tamanho
  const p = (dx, dy) => `${Math.round(x + dx * s)},${Math.round(ground - dy * s)}`
  const pillars = `M${p(-170, 0)}L${p(-155, 380)}L${p(-125, 380)}L${p(-130, 0)}Z` + `M${p(130, 0)}L${p(125, 380)}L${p(155, 380)}L${p(170, 0)}Z`
  const lowerBeam = `M${p(-220, 300)}L${p(220, 300)}L${p(220, 325)}L${p(-220, 325)}Z`
  const topBeam = `M${p(-270, 420)}Q${p(0, 390)} ${p(270, 420)}L${p(255, 385)}Q${p(0, 360)} ${p(-255, 385)}Z`
  const plate = `M${p(-15, 325)}L${p(15, 325)}L${p(15, 375)}L${p(-15, 375)}Z`
  return `<path d="${pillars}${lowerBeam}${topBeam}${plate}" class="wt-fill-c1"/>` + `<path d="${topBeam}" class="wt-fill-shade" opacity="0.35"/>`
}

// Pagode: andares empilhados, cada um com telhado de pontas viradas.
function pagoda(rand, centerX) {
  const floors = rand.int(3, 5)
  const x = centerX
  let y = SEA_TOP + 10
  let d = ''
  for (let i = 0; i < floors; i++) {
    const width = 300 - i * 50
    const wall = 70
    // parede do andar
    d += `M${Math.round(x - width * 0.35)},${Math.round(y)}h${Math.round(width * 0.7)}v${-wall}h${-Math.round(width * 0.7)}Z`
    y -= wall
    // telhado com as pontas para cima
    const roofHalf = width / 2 + 40
    d +=
      `M${Math.round(x - roofHalf)},${Math.round(y - 20)}Q${Math.round(x - roofHalf * 0.5)},${Math.round(y)} ${Math.round(x - width * 0.3)},${Math.round(y - 30)}` +
      `L${Math.round(x + width * 0.3)},${Math.round(y - 30)}Q${Math.round(x + roofHalf * 0.5)},${Math.round(y)} ${Math.round(x + roofHalf)},${Math.round(y - 20)}` +
      `L${Math.round(x + width * 0.25)},${Math.round(y - 60)}L${Math.round(x - width * 0.25)},${Math.round(y - 60)}Z`
    y -= 60
  }
  // ponteira no topo
  d += `M${Math.round(x - 5)},${Math.round(y)}h10v-90h-10Z`
  return `<path d="${d}" class="wt-fill-shade"/>`
}

// Nuvens estilizadas: barras arredondadas no céu.
function clouds(rand) {
  let result = ''
  for (let i = rand.int(3, 5); i > 0; i--) {
    const width = rand.range(220, 480)
    const x = rand.range(0, WIDTH - width)
    const y = rand.range(0.12, 0.55) * HEIGHT
    result += `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="22" rx="11" class="wt-fill-c2" opacity="0.3"/>`
  }
  return result
}

// Grous voando: duas asas em arco.
function cranes(rand, textArea) {
  let d = ''
  for (let i = rand.int(2, 5); i > 0; i--) {
    const [px, py] = pickPosition(rand, textArea)
    const x = Math.round(px)
    const y = Math.round(Math.min(py, HEIGHT * 0.5))
    const s = Math.round(rand.range(20, 38))
    d += `M${x - s * 2},${y - s}Q${x - s},${y - s * 1.4} ${x},${y}Q${x + s},${y - s * 1.4} ${x + s * 2},${y - s}`
  }
  return `<path d="${d}" fill="none" class="wt-stroke-shade" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`
}

// Bambus num canto: caules com "nós" e algumas folhas.
function bamboo(rand, baseX) {
  let stems = ''
  let nodes = ''
  let leaves = ''
  for (let i = rand.int(3, 5); i > 0; i--) {
    const x = baseX + rand.range(-110, 110)
    const width = rand.range(18, 28)
    stems += `M${Math.round(x)},0h${Math.round(width)}V${HEIGHT}h${-Math.round(width)}Z`
    for (let y = rand.range(60, 140); y < HEIGHT; y += rand.range(140, 200)) {
      nodes += `M${Math.round(x - 3)},${Math.round(y)}h${Math.round(width + 6)}`
      if (rand.chance(0.5)) {
        const side = rand.pick([-1, 1])
        const lx = Math.round(x + width / 2 + side * 55)
        leaves += `<ellipse cx="${lx}" cy="${Math.round(y - 15)}" rx="60" ry="12" transform="rotate(${side * -25} ${lx} ${Math.round(y - 15)})"/>`
      }
    }
  }
  return (
    `<path d="${stems}" class="wt-fill-shade" opacity="0.9"/>` +
    `<path d="${nodes}" class="wt-stroke-c2" stroke-width="5" opacity="0.6"/>` +
    `<g class="wt-fill-shade">${leaves}</g>`
  )
}

// Lanternas de papel penduradas no topo.
function lanterns(rand, textArea) {
  let result = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    const x = Math.round(textArea === 'center' ? rand.pick([rand.range(80, 500), rand.range(1420, 1840)]) : rand.range(1000, 1850))
    const hang = Math.round(rand.range(60, 220))
    result +=
      `<path d="M${x},0V${hang}" class="wt-stroke-shade" stroke-width="3"/>` +
      `<rect x="${x - 34}" y="${hang}" width="68" height="90" rx="30" class="wt-fill-c1"/>` +
      `<path d="M${x - 26},${hang + 30}h52M${x - 26},${hang + 60}h52" class="wt-stroke-shade" stroke-width="3" opacity="0.4"/>` +
      `<rect x="${x - 18}" y="${hang - 6}" width="36" height="10" class="wt-fill-shade"/>` +
      `<rect x="${x - 18}" y="${hang + 86}" width="36" height="10" class="wt-fill-shade"/>`
  }
  return result
}

// Pétalas de sakura caindo: elipses pequenas e giradas.
function petals(rand, intensity, textArea) {
  let result = ''
  const total = 10 + Math.round(intensity * 30)
  for (let i = 0; i < total; i++) {
    const [x, y] = pickPosition(rand, textArea).map(Math.round)
    const size = rand.range(8, 16)
    const angle = rand.int(0, 179)
    result += `<ellipse cx="${x}" cy="${y}" rx="${Math.round(size * 1.6)}" ry="${Math.round(size)}" transform="rotate(${angle} ${x} ${y})"/>`
  }
  return `<g class="wt-fill-c2" opacity="0.75">${result}</g>`
}
