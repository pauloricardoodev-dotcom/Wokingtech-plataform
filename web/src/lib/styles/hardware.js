import { COLOR_CLASSES, STROKE_CLASSES, circlePath, pickPosition, point } from './helpers.js'

// Tema "hardware": placa de circuito com chips, trilhas e componentes
// (resistores, capacitores, LEDs). As trilhas lembram as letras "TECH" da logo.
export function hardware(rand, { intensity, softness, textArea }) {
  const totalChips = 1 + Math.round(intensity * 2)
  const totalTraces = 8 + Math.round(intensity * 18)
  const totalParts = 2 + Math.round(intensity * 6)

  let chips = ''
  const pinEnds = [] // pontas dos pinos: as trilhas saem daqui
  for (let i = 0; i < totalChips; i++) {
    chips += chip(rand, pickPosition(rand, textArea), pinEnds)
  }

  let traces = ''
  for (let i = 0; i < totalTraces; i++) {
    // Mais da metade das trilhas sai de um pino; o resto começa solto.
    const usePin = pinEnds.length > 0 && rand.chance(0.6)
    const start = usePin
      ? pinEnds.splice(rand.int(0, pinEnds.length - 1), 1)[0]
      : { position: pickPosition(rand, textArea), direction: rand.int(0, 3) * 2 }
    traces += circuitTrace(rand, start)
  }

  let parts = ''
  for (let i = 0; i < totalParts; i++) {
    const draw = rand.pick([resistor, capacitor, led])
    parts += draw(rand, pickPosition(rand, textArea))
  }

  const board = boardPattern(rand)
  return {
    defs:
      board.defs +
      `<filter id="wt-blur"><feGaussianBlur stdDeviation="${(softness * 3).toFixed(1)}"/></filter>` +
      `<filter id="wt-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      board.body +
      `<g filter="url(#wt-blur)" stroke-linecap="round" stroke-linejoin="round">${traces}</g>` +
      chips +
      parts,
  }
}

// Fundo da placa: pontinhos, grade de linhas ou liso (sorteado).
function boardPattern(rand) {
  const kind = rand.pick(['dots', 'grid', 'none'])
  if (kind === 'none') return { defs: '', body: '' }
  const content =
    kind === 'dots'
      ? `<circle cx="24" cy="24" r="2.5" class="wt-fill-c1" opacity="0.3"/>`
      : `<path d="M48,0V48H0" fill="none" class="wt-stroke-c1" stroke-width="1.5" opacity="0.18"/>`
  return {
    defs: `<pattern id="wt-board" width="48" height="48" patternUnits="userSpaceOnUse">${content}</pattern>`,
    body: `<rect width="100%" height="100%" fill="url(#wt-board)"/>`,
  }
}

// As 8 direções possíveis: de 45° em 45° (0 = direita, 2 = baixo, 4 = esquerda, 6 = cima).
const DIRECTIONS = [
  [1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71],
  [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71],
]

// Uma trilha: anda reto, vira 45°, anda de novo... e termina numa bolinha.
function circuitTrace(rand, { position, direction }) {
  let current = position
  const points = [position]

  const segments = rand.int(2, 4)
  for (let i = 0; i < segments; i++) {
    const length = rand.range(80, 260)
    const [dx, dy] = DIRECTIONS[direction]
    current = [current[0] + dx * length, current[1] + dy * length]
    points.push(current)
    direction = (direction + rand.pick([1, 7])) % 8 // vira para um lado ou o outro
  }

  const colorIndex = rand.int(0, 2)
  const width = rand.int(4, 8)
  const [endX, endY] = current
  // A ponta pode ser uma bolinha cheia ou um anel (furo da placa).
  const end = rand.chance(0.7)
    ? `<circle cx="${Math.round(endX)}" cy="${Math.round(endY)}" r="${width + 5}"/>`
    : `<circle cx="${Math.round(endX)}" cy="${Math.round(endY)}" r="${width + 6}" fill="none" stroke-width="${width}"/>`

  return (
    `<g class="${COLOR_CLASSES[colorIndex]} ${STROKE_CLASSES[colorIndex]}" opacity="${rand.range(0.5, 0.95).toFixed(2)}">` +
    `<path d="M${points.map(point).join('L')}" fill="none" stroke-width="${width}"/>${end}</g>`
  )
}

// Um chip: retângulo com pinos nos quatro lados.
function chip(rand, [cx, cy], pinEnds) {
  const width = rand.range(140, 260)
  const height = rand.chance(0.5) ? width : rand.range(100, 180) // quadrado ou retangular
  const pinLength = 26

  let pins = ''
  const sides = [
    { count: rand.int(4, 7), along: 'x', y: cy - height / 2, dy: -1, direction: 6 },
    { count: rand.int(4, 7), along: 'x', y: cy + height / 2, dy: 1, direction: 2 },
    { count: rand.int(3, 6), along: 'y', x: cx - width / 2, dx: -1, direction: 4 },
    { count: rand.int(3, 6), along: 'y', x: cx + width / 2, dx: 1, direction: 0 },
  ]
  for (const side of sides) {
    const length = side.along === 'x' ? width : height
    for (let i = 0; i < side.count; i++) {
      const offset = -length / 2 + (length / (side.count + 1)) * (i + 1)
      const start = side.along === 'x' ? [cx + offset, side.y] : [side.x, cy + offset]
      const end = side.along === 'x' ? [start[0], start[1] + side.dy * pinLength] : [start[0] + side.dx * pinLength, start[1]]
      pins += `M${point(start)}L${point(end)}`
      pinEnds.push({ position: end, direction: side.direction })
    }
  }

  const innerW = Math.round(width * 0.5)
  const innerH = Math.round(height * 0.5)
  return (
    `<path d="${pins}" class="wt-stroke-c1" stroke-width="8" stroke-linecap="round"/>` +
    `<rect x="${Math.round(cx - width / 2)}" y="${Math.round(cy - height / 2)}" width="${Math.round(width)}" height="${Math.round(height)}" rx="14" class="wt-fill-shade wt-stroke-c1" stroke-width="4"/>` +
    `<rect x="${Math.round(cx - innerW / 2)}" y="${Math.round(cy - innerH / 2)}" width="${innerW}" height="${innerH}" rx="8" class="wt-fill-c1" opacity="0.35"/>` +
    // bolinha que marca o pino 1, como nos chips de verdade
    `<circle cx="${Math.round(cx - width / 2 + 22)}" cy="${Math.round(cy - height / 2 + 22)}" r="7" class="wt-fill-c2"/>`
  )
}

// Resistor: corpo arredondado com faixas coloridas e dois "fios".
function resistor(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  const angle = rand.pick([0, 90, 45, -45])
  let bands = ''
  for (let i = 0; i < 3; i++) {
    bands += `<rect x="${-30 + i * 22}" y="-18" width="9" height="36" class="${rand.pick(COLOR_CLASSES)}"/>`
  }
  return (
    `<g transform="translate(${x} ${y}) rotate(${angle})">` +
    `<path d="M-90,0H90" class="wt-stroke-c1" stroke-width="6" stroke-linecap="round"/>` +
    `<rect x="-50" y="-20" width="100" height="40" rx="18" class="wt-fill-shade wt-stroke-c2" stroke-width="3"/>${bands}</g>`
  )
}

// Capacitor visto de cima: círculo com uma faixa de um lado.
function capacitor(rand, [cx, cy]) {
  const r = Math.round(rand.range(26, 44))
  const x = Math.round(cx)
  const y = Math.round(cy)
  return (
    `<circle cx="${x}" cy="${y}" r="${r}" class="wt-fill-shade wt-stroke-c3" stroke-width="5"/>` +
    `<path d="M${x - r * 0.5},${y - r * 0.6}V${y + r * 0.6}" class="wt-stroke-c2" stroke-width="6" stroke-linecap="round"/>`
  )
}

// LED: bolinha que brilha.
function led(rand, [cx, cy]) {
  return `<path d="${circlePath(cx, cy, rand.range(10, 18))}" class="${rand.pick(COLOR_CLASSES)}" filter="url(#wt-glow)"/>`
}
