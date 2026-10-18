import { HEIGHT, WIDTH, round } from './helpers.js'

const COLORS = ['wt-fill-c1', 'wt-fill-c2', 'wt-fill-c3', 'wt-fill-shade']
const ROWS = 5
const CELL = HEIGHT / ROWS // cada bloco é um quadrado de 216×216

// Estilo "Bauhaus": uma grade de blocos quadrados, cada um com uma forma
// geométrica simples (quarto de círculo, meia-lua, triângulo, listras...).
// A grade fica ao lado do texto (ou nas duas laterais, se o texto for no centro).
export function bauhaus(rand, { intensity, softness, textArea }) {
  const gap = round(softness * 14) // mais suavidade = mais espaço entre blocos
  const corner = round(softness * 18)
  const emptyChance = 0.3 - intensity * 0.25 // mais intensidade = menos blocos vazios

  let blocks = ''
  const cells = []
  for (const firstColumn of columnStarts(textArea)) {
    for (let col = 0; col < firstColumn.count; col++) {
      for (let row = 0; row < ROWS; row++) {
        const x = firstColumn.x + col * CELL
        const y = row * CELL
        if (col < firstColumn.count - 1 && row < ROWS - 1) cells.push([x, y])
        if (rand.chance(emptyChance)) continue
        blocks += block(rand, x + gap / 2, y + gap / 2, CELL - gap, corner)
      }
    }
  }

  // Destaque: às vezes um círculo grande atravessa 2×2 blocos, com um anel por dentro.
  let highlight = ''
  if (rand.chance(0.5)) {
    const [x, y] = rand.pick(cells)
    const color = rand.pick(COLORS)
    highlight =
      `<circle cx="${round(x + CELL)}" cy="${round(y + CELL)}" r="${round(CELL * 0.85)}" class="${color}" opacity="0.92"/>` +
      `<circle cx="${round(x + CELL)}" cy="${round(y + CELL)}" r="${round(CELL * 0.55)}" fill="none" class="wt-stroke-bg" stroke-width="10" opacity="0.6"/>`
  }

  return { defs: '', body: blocks + highlight }
}

// Onde começam as colunas de blocos e quantas são.
function columnStarts(textArea) {
  if (textArea === 'center') {
    return [
      { x: 0, count: 2 },
      { x: WIDTH - CELL * 2, count: 2 },
    ]
  }
  return [{ x: WIDTH - CELL * 5, count: 5 }]
}

// Um bloco: fundo de uma cor + forma de outra cor, girada 0°, 90°, 180° ou 270°.
function block(rand, x, y, size, corner) {
  const background = rand.pick(COLORS)
  const others = COLORS.filter((color) => color !== background)
  const color = rand.pick(others)
  const s = round(size)
  const half = round(size / 2)
  const angle = rand.int(0, 3) * 90

  const shapes = {
    quarter: `<path d="M0,${s}V0A${s},${s} 0 0 1 ${s},${s}Z" class="${color}"/>`,
    half: `<path d="M0,${s}A${half},${half} 0 0 1 ${s},${s}Z" class="${color}"/>`,
    circle: `<circle cx="${half}" cy="${half}" r="${round(size * 0.36)}" class="${color}"/>`,
    ring: `<circle cx="${half}" cy="${half}" r="${round(size * 0.3)}" fill="none" class="${color.replace('fill', 'stroke')}" stroke-width="${round(size * 0.12)}"/>`,
    triangle: `<path d="M0,${s}L${half},0L${s},${s}Z" class="${color}"/>`,
    stripes:
      `<rect y="${round(size * 0.1)}" width="${s}" height="${round(size * 0.18)}" class="${color}"/>` +
      `<rect y="${round(size * 0.41)}" width="${s}" height="${round(size * 0.18)}" class="${color}"/>` +
      `<rect y="${round(size * 0.72)}" width="${s}" height="${round(size * 0.18)}" class="${color}"/>`,
    diagonal: `<path d="M0,0H${s}V${s}Z" class="${color}"/>`,
    dot: `<rect width="${half}" height="${half}" class="${color}"/><circle cx="${round(size * 0.72)}" cy="${round(size * 0.72)}" r="${round(size * 0.16)}" class="${rand.pick(others)}"/>`,
    concentric:
      `<circle cx="${half}" cy="${half}" r="${round(size * 0.42)}" class="${color}"/>` +
      `<circle cx="${half}" cy="${half}" r="${round(size * 0.28)}" class="${background}"/>` +
      `<circle cx="${half}" cy="${half}" r="${round(size * 0.14)}" class="${rand.pick(others)}"/>`,
    arch: `<path d="M${round(size * 0.15)},${s}V${half}A${round(size * 0.35)},${round(size * 0.35)} 0 0 1 ${round(size * 0.85)},${half}V${s}Z" class="${color}"/>`,
    cross: `<path d="M${round(size * 0.38)},0h${round(size * 0.24)}v${s}h${-round(size * 0.24)}ZM0,${round(size * 0.38)}h${s}v${round(size * 0.24)}h${-s}Z" class="${color}"/>`,
    dots: gridOfDots(size, color),
  }
  const shape = rand.pick(Object.values(shapes))

  // Detalhe pequeno em alguns blocos: um pontinho no canto ou uma linha fina.
  const detail = rand.pick([
    '',
    '',
    `<circle cx="${round(size * 0.14)}" cy="${round(size * 0.14)}" r="${round(size * 0.05)}" class="${rand.pick(others)}"/>`,
    `<path d="M${round(size * 0.1)},${round(size * 0.9)}H${round(size * 0.9)}" class="${rand.pick(others).replace('fill', 'stroke')}" stroke-width="4"/>`,
  ])

  return (
    `<g transform="translate(${round(x)} ${round(y)}) rotate(${angle} ${half} ${half})">` +
    `<rect width="${s}" height="${s}" rx="${corner}" class="${background}"/>${shape}${detail}</g>`
  )
}

// Grade 3×3 de bolinhas dentro do bloco.
function gridOfDots(size, color) {
  let dots = ''
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      dots += `<circle cx="${round(size * (0.22 + i * 0.28))}" cy="${round(size * (0.22 + j * 0.28))}" r="${round(size * 0.08)}"/>`
    }
  }
  return `<g class="${color}">${dots}</g>`
}
