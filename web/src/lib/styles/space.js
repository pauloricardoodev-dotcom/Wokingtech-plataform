import { HEIGHT, WIDTH, circlePath, focusPosition, pickPosition, round } from './helpers.js'

// Tema "espaço": estrelas, nebulosa colorida e planetas.
// Extras sorteados: anéis nos planetas, crateras, foguete, cometa.
export function space(rand, { intensity, softness, textArea }) {
  let planets = ''
  const totalPlanets = rand.int(1, 3)
  for (let i = 0; i < totalPlanets; i++) {
    // O primeiro planeta é o grande, os outros são menores e soltos.
    const center = i === 0 ? focusPosition(rand, textArea) : pickPosition(rand, textArea)
    const radius = i === 0 ? rand.range(150, 240) : rand.range(40, 100)
    if (i === 0) {
      // brilho de atmosfera em volta do planeta grande
      planets += `<path d="${circlePath(center[0], center[1], radius * 1.25)}" class="wt-fill-c2" opacity="0.25" filter="url(#wt-nebula)"/>`
    }
    planets += planet(rand, center, radius)
    // às vezes o planeta grande tem uma lua com a órbita desenhada
    if (i === 0 && rand.chance(0.5)) planets += orbitingMoon(rand, center, radius)
  }

  return {
    defs:
      planetGradient('wt-planet-1', 'c2', 'c1') +
      planetGradient('wt-planet-2', 'c1', 'c3') +
      planetGradient('wt-planet-3', 'c3', 'shade') +
      `<filter id="wt-nebula" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(60 + softness * 80)}"/></filter>` +
      `<filter id="wt-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      nebula(rand, intensity, textArea) +
      stars(rand, intensity) +
      (rand.chance(0.5) ? constellation(rand, textArea) : '') +
      (rand.chance(0.4) ? comet(rand, textArea) : '') +
      (rand.chance(0.4) ? asteroids(rand, textArea) : '') +
      planets +
      (rand.chance(0.4) ? rocket(rand, pickPosition(rand, textArea)) : '') +
      (rand.chance(0.35) ? satellite(rand, pickPosition(rand, textArea)) : ''),
  }
}

// Degradê do planeta: claro no canto de cima (onde "bate o sol").
function planetGradient(id, light, dark) {
  return (
    `<radialGradient id="${id}" cx="0.35" cy="0.3" r="0.8">` +
    `<stop offset="0" class="wt-stop-${light}"/><stop offset="1" class="wt-stop-${dark}"/></radialGradient>`
  )
}

function nebula(rand, intensity, textArea) {
  let clouds = ''
  for (let i = 2 + Math.round(intensity * 2); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    clouds += `<path d="${circlePath(x, y, rand.range(200, 380))}" class="${rand.pick(['wt-fill-c1', 'wt-fill-c2', 'wt-fill-c3'])}" opacity="0.35"/>`
  }
  return `<g filter="url(#wt-nebula)">${clouds}</g>`
}

// Duas camadas de estrelas (pequenas e muitas, maiores e poucas)
// e algumas estrelas "brilhando" em forma de cruz.
function stars(rand, intensity) {
  let small = ''
  for (let i = 60 + Math.round(intensity * 60); i > 0; i--) {
    small += circlePath(rand.range(0, WIDTH), rand.range(0, HEIGHT), rand.range(1, 2.5))
  }
  let big = ''
  for (let i = rand.int(8, 16); i > 0; i--) {
    big += circlePath(rand.range(0, WIDTH), rand.range(0, HEIGHT), rand.range(3, 5))
  }
  let shine = ''
  for (let i = rand.int(3, 6); i > 0; i--) {
    const x = Math.round(rand.range(0, WIDTH))
    const y = Math.round(rand.range(0, HEIGHT))
    const s = Math.round(rand.range(12, 24))
    shine += `M${x - s},${y}H${x + s}M${x},${y - s}V${y + s}`
  }
  return (
    `<path d="${small}" class="wt-fill-detail" opacity="0.6"/>` +
    `<path d="${big}" class="wt-fill-detail" opacity="0.9"/>` +
    `<path d="${shine}" class="wt-stroke-detail" stroke-width="3" stroke-linecap="round" filter="url(#wt-glow)"/>`
  )
}

function planet(rand, [cx, cy], radius) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  const r = Math.round(radius)
  const gradient = rand.pick(['wt-planet-1', 'wt-planet-2', 'wt-planet-3'])
  const body = `<path d="${circlePath(x, y, r)}" fill="url(#${gradient})"/>`

  // Planeta com anel: metade de trás do anel, planeta, metade da frente.
  if (rand.chance(0.45)) {
    const rx = Math.round(r * 1.9)
    const ry = Math.round(r * 0.42)
    const angle = rand.int(-25, 25)
    const ring = rand.pick(['wt-stroke-c2', 'wt-stroke-c1'])
    const width = Math.max(6, Math.round(r * 0.1))
    // dois anéis: um largo e outro fino um pouco mais para fora
    const rx2 = Math.round(rx * 1.12)
    const ry2 = Math.round(ry * 1.12)
    const back = `M${-rx},0A${rx},${ry} 0 0 1 ${rx},0M${-rx2},0A${rx2},${ry2} 0 0 1 ${rx2},0`
    const front = `M${-rx},0A${rx},${ry} 0 0 0 ${rx},0M${-rx2},0A${rx2},${ry2} 0 0 0 ${rx2},0`
    return (
      `<g transform="translate(${x} ${y}) rotate(${angle})">` +
      `<path d="${back}" fill="none" class="${ring}" stroke-width="${width}" opacity="0.7"/></g>` +
      body +
      // sombra do anel passando na frente do planeta
      `<g transform="translate(${x} ${y}) rotate(${angle})">` +
      `<path d="M${-r},${Math.round(ry * 0.3)}A${r},${Math.round(ry * 0.6)} 0 0 0 ${r},${Math.round(ry * 0.3)}" fill="none" class="wt-stroke-shade" stroke-width="${width}" opacity="0.3"/>` +
      `<path d="${front}" fill="none" class="${ring}" stroke-width="${width}"/></g>`
    )
  }

  // Planeta sem anel: pode ganhar crateras ou faixas.
  let details = ''
  if (rand.chance(0.5)) {
    for (let i = rand.int(3, 6); i > 0; i--) {
      const angle = rand.range(0, Math.PI * 2)
      const distance = rand.range(0, r * 0.6)
      details += circlePath(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, rand.range(r * 0.08, r * 0.2))
    }
    details = `<path d="${details}" class="wt-fill-shade" opacity="0.25"/>`
  } else {
    for (let i = -2; i <= 2; i++) {
      const bandY = y + i * r * 0.32
      const half = Math.sqrt(Math.max(0, r * r - (bandY - y) ** 2)) * 0.95
      details += `M${Math.round(x - half)},${Math.round(bandY)}H${Math.round(x + half)}`
    }
    details = `<path d="${details}" class="wt-stroke-shade" stroke-width="${Math.max(4, Math.round(r * 0.08))}" stroke-linecap="round" opacity="0.2"/>`
  }
  return body + details
}

// Lua pequena com a linha da órbita tracejada em volta do planeta.
function orbitingMoon(rand, [cx, cy], radius) {
  const orbit = radius * 1.6
  const a = rand.range(0, Math.PI * 2)
  const mx = cx + Math.cos(a) * orbit
  const my = cy + Math.sin(a) * orbit * 0.35
  return (
    `<ellipse cx="${Math.round(cx)}" cy="${Math.round(cy)}" rx="${Math.round(orbit)}" ry="${Math.round(orbit * 0.35)}" fill="none" class="wt-stroke-c2" stroke-width="3" stroke-dasharray="6 14" opacity="0.6"/>` +
    `<path d="${circlePath(mx, my, radius * 0.18)}" fill="url(#wt-planet-3)"/>`
  )
}

// Constelação: algumas estrelas ligadas por linhas finas.
function constellation(rand, textArea) {
  const [x, y] = pickPosition(rand, textArea)
  const points = []
  for (let i = rand.int(4, 6); i > 0; i--) {
    points.push([x + rand.range(-180, 180), y + rand.range(-120, 120)])
  }
  const lines = 'M' + points.map(([px, py]) => `${Math.round(px)},${Math.round(py)}`).join('L')
  const dots = points.map(([px, py]) => circlePath(px, py, 6)).join('')
  return (
    `<path d="${lines}" fill="none" class="wt-stroke-detail" stroke-width="2" opacity="0.5"/>` +
    `<path d="${dots}" class="wt-fill-detail" filter="url(#wt-glow)"/>`
  )
}

// Asteroides: pedrinhas irregulares (polígonos tortos).
function asteroids(rand, textArea) {
  let d = ''
  for (let i = rand.int(4, 8); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    const r = rand.range(10, 30)
    const sides = rand.int(6, 8)
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2
      const k = rand.range(0.7, 1.1)
      d += `${s ? 'L' : 'M'}${Math.round(x + Math.cos(a) * r * k)},${Math.round(y + Math.sin(a) * r * k)}`
    }
    d += 'Z'
  }
  return `<path d="${d}" class="wt-fill-c3 wt-stroke-shade" stroke-width="3" stroke-linejoin="round"/>`
}

// Satélite: corpo com antena e dois painéis solares quadriculados.
function satellite(rand, [cx, cy]) {
  const panel = (x) =>
    `<rect x="${x}" y="-28" width="110" height="56" class="wt-fill-c1 wt-stroke-shade" stroke-width="4"/>` +
    `<path d="M${x + 37},-28V28M${x + 73},-28V28M${x},0H${x + 110}" class="wt-stroke-shade" stroke-width="3"/>`
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-40, 40)}) scale(${round(rand.range(0.6, 0.9))})">` +
    `<path d="M-160,0H160" class="wt-stroke-shade" stroke-width="6"/>` +
    panel(-180) + panel(70) +
    `<rect x="-38" y="-45" width="76" height="90" rx="10" class="wt-fill-c2 wt-stroke-shade" stroke-width="5"/>` +
    `<path d="M0,-45V-80" class="wt-stroke-shade" stroke-width="5"/>` +
    `<path d="M-25,-95Q0,-70 25,-95Z" class="wt-fill-c2 wt-stroke-shade" stroke-width="4"/></g>`
  )
}

// Foguete apontando para cima, girado um pouco, com chama brilhando.
function rocket(rand, [cx, cy]) {
  const angle = rand.int(15, 60)
  const scale = round(rand.range(0.6, 1))
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${angle}) scale(${scale})">` +
    `<path d="M-22,70Q0,170 22,70Z" class="wt-fill-c3" filter="url(#wt-glow)"/>` +
    `<path d="M-40,20L-80,80L-40,70ZM40,20L80,80L40,70Z" class="wt-fill-c1"/>` +
    `<path d="M0,-130C45,-90 50,-20 42,75H-42C-50,-20-45,-90 0,-130Z" class="wt-fill-c2 wt-stroke-shade" stroke-width="6"/>` +
    `<path d="${circlePath(0, -35, 20)}" class="wt-fill-shade wt-stroke-c1" stroke-width="6"/>` +
    `</g>`
  )
}

// Cometa: cabeça brilhante com uma cauda que vai afinando.
function comet(rand, textArea) {
  const [x, y] = pickPosition(rand, textArea).map(Math.round)
  const angle = rand.int(200, 240)
  const length = Math.round(rand.range(220, 380))
  return (
    `<g transform="translate(${x} ${y}) rotate(${angle})" filter="url(#wt-glow)">` +
    `<path d="M0,-12L${length},0L0,12Z" class="wt-fill-detail" opacity="0.45"/>` +
    `<path d="${circlePath(0, 0, 13)}" class="wt-fill-detail"/></g>`
  )
}
