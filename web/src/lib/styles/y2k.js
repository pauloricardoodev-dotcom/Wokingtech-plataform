import {
  COLOR_CLASSES, HEIGHT, STROKE_CLASSES, WIDTH,
  circlePath, heartPath, pickPosition, round, smoothClosedPath,
} from './helpers.js'

// Tema "Y2K / futurismo 2000s": gotas cromadas, bolhas brilhantes e estrelinhas.
// Cada cena sorteia mais 2 ou 3 enfeites da época: CDs, corações, florzinhas,
// borboletas e carinhas sorridentes. Às vezes aparece uma grade ao fundo.
export function y2k(rand, { intensity, softness, textArea }) {
  let chrome = ''
  for (let i = rand.int(1, 2); i > 0; i--) {
    chrome += chromeBlob(rand, pickPosition(rand, textArea))
  }

  let bubbles = ''
  for (let i = 3 + Math.round(intensity * 6); i > 0; i--) {
    bubbles += bubble(rand, pickPosition(rand, textArea))
  }

  let sparkles = ''
  for (let i = 6 + Math.round(intensity * 14); i > 0; i--) {
    sparkles += sparkle(rand, pickPosition(rand, textArea))
  }

  // Sorteia quais enfeites entram nesta cena (2 ou 3 tipos diferentes).
  const ornaments = [cd, hearts, flowers, butterfly, smiley]
  let extras = ''
  for (let i = rand.int(2, 3); i > 0; i--) {
    const draw = ornaments.splice(rand.int(0, ornaments.length - 1), 1)[0]
    extras += draw(rand, pickPosition(rand, textArea))
  }

  const grid = rand.chance(0.45)
  return {
    defs:
      // cromado: faixas de cor que imitam o reflexo de metal
      `<linearGradient id="wt-chrome" x1="0" y1="0" x2="0.3" y2="1">` +
      `<stop offset="0" class="wt-stop-c2"/><stop offset="0.45" class="wt-stop-c1"/>` +
      `<stop offset="0.5" class="wt-stop-c3"/><stop offset="1" class="wt-stop-c2"/></linearGradient>` +
      `<radialGradient id="wt-bubble" cx="0.35" cy="0.3">` +
      `<stop offset="0" class="wt-stop-c2"/><stop offset="0.6" class="wt-stop-c1" stop-opacity="0.6"/>` +
      `<stop offset="1" class="wt-stop-c3" stop-opacity="0.9"/></radialGradient>` +
      `<linearGradient id="wt-disc" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" class="wt-stop-c1"/><stop offset="0.5" class="wt-stop-c2"/><stop offset="1" class="wt-stop-c3"/></linearGradient>` +
      `<filter id="wt-glow" x="-100%" y="-100%" width="300%" height="300%">` +
      `<feGaussianBlur stdDeviation="${round(2 + softness * 8)}" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      (grid ? perspectiveGrid() : '') +
      chrome + bubbles + extras +
      `<g filter="url(#wt-glow)">${sparkles}</g>`,
  }
}

// Grade em perspectiva na parte de baixo (bem típica dos anos 2000).
function perspectiveGrid() {
  const horizon = HEIGHT * 0.62
  let d = ''
  for (let i = 1; i <= 8; i++) {
    d += `M0,${Math.round(horizon + (HEIGHT - horizon) * (i / 8) ** 2)}H${WIDTH}`
  }
  for (let i = -10; i <= 10; i++) {
    d += `M${WIDTH / 2},${Math.round(horizon)}L${Math.round(WIDTH / 2 + i * 240)},${HEIGHT}`
  }
  return `<path d="${d}" fill="none" class="wt-stroke-c1" stroke-width="2" opacity="0.35"/>`
}

// Gota cromada com um anel de órbita em volta.
function chromeBlob(rand, [cx, cy]) {
  const radius = rand.range(170, 260)
  const points = []
  const total = rand.int(5, 7)
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2
    const r = radius * rand.range(0.75, 1.15)
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }
  const x = Math.round(cx)
  const y = Math.round(cy)
  const orbit = rand.chance(0.7)
    ? `<ellipse cx="${x}" cy="${y}" rx="${Math.round(radius * 1.7)}" ry="${Math.round(radius * 0.45)}" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="5" transform="rotate(${rand.int(-30, 30)} ${x} ${y})"/>`
    : ''
  return `<path d="${smoothClosedPath(points)}" fill="url(#wt-chrome)"/>` + orbit
}

// Bolha: círculo com degradê e um reflexo pequeno no canto.
function bubble(rand, [cx, cy]) {
  const r = rand.range(30, 90)
  const hx = Math.round(cx - r * 0.35)
  const hy = Math.round(cy - r * 0.4)
  return (
    `<path d="${circlePath(cx, cy, r)}" fill="url(#wt-bubble)" opacity="0.85"/>` +
    `<ellipse cx="${hx}" cy="${hy}" rx="${Math.round(r * 0.28)}" ry="${Math.round(r * 0.16)}" class="wt-fill-c2" opacity="0.9" transform="rotate(-35 ${hx} ${hy})"/>`
  )
}

// Estrelinha de quatro pontas (curvas que "puxam" para o centro).
function sparkle(rand, [cx, cy]) {
  const s = Math.round(rand.range(14, 48))
  const x = Math.round(cx)
  const y = Math.round(cy)
  return `<path d="M${x},${y - s}Q${x},${y} ${x + s},${y}Q${x},${y} ${x},${y + s}Q${x},${y} ${x - s},${y}Q${x},${y} ${x},${y - s}Z" class="${rand.pick(COLOR_CLASSES)}"/>`
}

// CD: disco furta-cor com furo no meio.
function cd(rand, [x, y]) {
  const r = rand.range(90, 140)
  return (
    `<path d="${circlePath(x, y, r)}" fill="url(#wt-disc)" class="wt-stroke-c2" stroke-width="3"/>` +
    `<path d="${circlePath(x, y, r * 0.7)}" fill="none" class="wt-stroke-bg" stroke-width="2" opacity="0.4"/>` +
    `<path d="${circlePath(x, y, r * 0.18)}" class="wt-fill-bg wt-stroke-c2" stroke-width="3"/>`
  )
}

function hearts(rand, [x, y]) {
  let d = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    d += heartPath(x + rand.range(-180, 180), y + rand.range(-120, 120), rand.range(40, 90))
  }
  return `<path d="${d}" class="${rand.pick(COLOR_CLASSES)}"/>`
}

// Florzinha: cinco círculos em volta de um miolo.
function flowers(rand, [x, y]) {
  let petals = ''
  let centers = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    const cx = x + rand.range(-180, 180)
    const cy = y + rand.range(-120, 120)
    const r = rand.range(16, 30)
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2
      petals += circlePath(cx + Math.cos(angle) * r * 1.2, cy + Math.sin(angle) * r * 1.2, r)
    }
    centers += circlePath(cx, cy, r * 0.8)
  }
  return `<path d="${petals}" class="${rand.pick(COLOR_CLASSES)}"/><path d="${centers}" class="wt-fill-c2 wt-stroke-shade" stroke-width="3"/>`
}

// Borboleta: duas asas grandes em cima, duas pequenas embaixo.
function butterfly(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  const s = rand.range(0.8, 1.3)
  const wing = (dx, dy, rx, ry, angle) =>
    `<ellipse cx="${Math.round(x + dx * s)}" cy="${Math.round(y + dy * s)}" rx="${Math.round(rx * s)}" ry="${Math.round(ry * s)}" transform="rotate(${angle} ${Math.round(x + dx * s)} ${Math.round(y + dy * s)})"/>`
  return (
    `<g class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="4" opacity="0.9" transform="rotate(${rand.int(-20, 20)} ${x} ${y})">` +
    wing(-45, -25, 50, 35, -30) + wing(45, -25, 50, 35, 30) + wing(-35, 30, 32, 24, 30) + wing(35, 30, 32, 24, -30) +
    `</g><rect x="${x - 6}" y="${Math.round(y - 55 * s)}" width="12" height="${Math.round(110 * s)}" rx="6" class="wt-fill-shade"/>`
  )
}

// Carinha sorridente.
function smiley(rand, [x, y]) {
  const r = rand.range(55, 85)
  const eyes = circlePath(x - r * 0.35, y - r * 0.2, r * 0.12) + circlePath(x + r * 0.35, y - r * 0.2, r * 0.12)
  const smile = `M${Math.round(x - r * 0.5)},${Math.round(y + r * 0.15)}Q${Math.round(x)},${Math.round(y + r * 0.75)} ${Math.round(x + r * 0.5)},${Math.round(y + r * 0.15)}`
  return (
    `<path d="${circlePath(x, y, r)}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="5"/>` +
    `<path d="${eyes}" class="wt-fill-shade"/>` +
    `<path d="${smile}" fill="none" class="wt-stroke-shade" stroke-width="7" stroke-linecap="round"/>`
  )
}
