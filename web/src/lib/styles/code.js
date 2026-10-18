import { COLOR_CLASSES, HEIGHT, STROKE_CLASSES, WIDTH, circlePath, pickPosition } from './helpers.js'

// Tema "códigos": janelas de editor e terminal com o código desenhado como
// barrinhas coloridas (igual ao minimapa do VS Code), gráfico de branches
// do git, cursor piscando e símbolos como </> e { }.
// Não usamos texto de verdade: o background não deve ter letras.
export function code(rand, { intensity, softness, textArea }) {
  let panels = ''
  for (const area of windowAreas(textArea)) {
    // Cada espaço vira um editor, um terminal ou um gráfico do git.
    const kind = rand.pick(['editor', 'editor', 'terminal', 'git'])
    if (kind === 'editor') panels += editorWindow(rand, area, intensity)
    else if (kind === 'terminal') panels += terminalWindow(rand, area)
    else panels += gitGraph(rand, area)
  }

  let symbols = ''
  const totalSymbols = 3 + Math.round(intensity * 5)
  for (let i = 0; i < totalSymbols; i++) {
    symbols += symbol(rand, pickPosition(rand, textArea))
  }

  const background = rand.chance(0.5)
    ? `<pattern id="wt-dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2" class="wt-fill-c1" opacity="0.25"/></pattern>`
    : ''

  return {
    defs: background + `<filter id="wt-blur"><feGaussianBlur stdDeviation="${(softness * 6).toFixed(1)}"/></filter>`,
    body:
      (background ? `<rect width="100%" height="100%" fill="url(#wt-dots)"/>` : '') +
      `<g filter="url(#wt-blur)" fill="none" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">${symbols}</g>` +
      panels,
  }
}

// Onde ficam as janelas, para não cobrir o texto do hero.
function windowAreas(textArea) {
  if (textArea === 'center') {
    return [
      { x: -0.08 * WIDTH, y: 0.12 * HEIGHT, width: 0.3 * WIDTH, height: 0.6 * HEIGHT },
      { x: 0.76 * WIDTH, y: 0.32 * HEIGHT, width: 0.3 * WIDTH, height: 0.6 * HEIGHT },
    ]
  }
  return [
    { x: 0.52 * WIDTH, y: 0.1 * HEIGHT, width: 0.36 * WIDTH, height: 0.55 * HEIGHT },
    { x: 0.66 * WIDTH, y: 0.45 * HEIGHT, width: 0.36 * WIDTH, height: 0.6 * HEIGHT },
  ]
}

// Moldura de janela com as três bolinhas no topo.
function windowFrame({ x, y, width, height }) {
  let frame = `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="${Math.round(height)}" rx="18" class="wt-fill-shade wt-stroke-c1" stroke-width="2" stroke-opacity="0.5" opacity="0.95"/>`
  for (let i = 0; i < 3; i++) {
    frame += `<circle cx="${Math.round(x + 28 + i * 26)}" cy="${Math.round(y + 22)}" r="8" class="${COLOR_CLASSES[2 - i]}"/>`
  }
  return frame
}

function bar(x, y, width, color) {
  return `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${Math.round(width)}" height="14" rx="7" class="${color}" opacity="0.85"/>`
}

function editorWindow(rand, area, intensity) {
  const { x, y, width, height } = area
  let content = windowFrame(area)

  // As "linhas de código": cada linha tem recuo e algumas palavras (barrinhas).
  let indent = 0
  let lastBarEnd = [x + 32, y + 72]
  for (let lineY = y + 72; lineY < y + height - 30; lineY += 34) {
    if (rand.chance(0.15)) continue // linha em branco
    indent = Math.max(0, Math.min(3, indent + rand.pick([-1, 0, 0, 1])))

    let tokenX = x + 32 + indent * 36
    const words = rand.int(1, 2 + Math.round(intensity * 3))
    for (let i = 0; i < words; i++) {
      const tokenWidth = rand.range(40, 170)
      if (tokenX + tokenWidth > x + width - 24) break
      content += bar(tokenX, lineY, tokenWidth, rand.pick(COLOR_CLASSES))
      tokenX += tokenWidth + 14
      lastBarEnd = [tokenX, lineY]
    }
  }

  // Às vezes, um cursor no fim da última linha.
  if (rand.chance(0.6)) {
    content += `<rect x="${Math.round(lastBarEnd[0])}" y="${Math.round(lastBarEnd[1] - 6)}" width="12" height="26" class="wt-fill-c2"/>`
  }
  return `<g>${content}</g>`
}

// Terminal: cada linha começa com um ">" seguido de um comando curto.
function terminalWindow(rand, area) {
  const { x, y, width, height } = area
  let content = windowFrame(area)
  for (let lineY = y + 72; lineY < y + height - 40; lineY += 40) {
    const chevron = `M${Math.round(x + 30)},${Math.round(lineY)}l12,8l-12,8`
    content += `<path d="${chevron}" fill="none" class="wt-stroke-c2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
    content += bar(x + 58, lineY + 1, rand.range(80, Math.min(360, width - 100)), rand.chance(0.25) ? 'wt-fill-c3' : 'wt-fill-c1')
  }
  return `<g>${content}</g>`
}

// Gráfico de branches do git: uma linha principal e ramos que saem e voltam.
function gitGraph(rand, { x, y, width, height }) {
  const mainX = x + width * 0.35
  const top = y + 40
  const bottom = y + height - 40
  let lines = `M${Math.round(mainX)},${Math.round(top)}V${Math.round(bottom)}`
  let commits = ''

  const totalCommits = rand.int(5, 8)
  const step = (bottom - top) / (totalCommits - 1)
  for (let i = 0; i < totalCommits; i++) {
    commits += circlePath(mainX, top + i * step, 14)
  }

  // Um ou dois ramos: saem da linha principal, têm commits e voltam.
  for (let branch = rand.int(1, 2); branch > 0; branch--) {
    const branchX = mainX + rand.range(90, width * 0.5)
    const start = rand.int(0, totalCommits - 4)
    const end = start + rand.int(2, 3)
    const startY = top + start * step
    const endY = top + end * step
    lines +=
      `M${Math.round(mainX)},${Math.round(startY)}C${Math.round(branchX)},${Math.round(startY)} ${Math.round(branchX)},${Math.round(startY)} ${Math.round(branchX)},${Math.round(startY + step)}` +
      `V${Math.round(endY - step)}C${Math.round(branchX)},${Math.round(endY)} ${Math.round(branchX)},${Math.round(endY)} ${Math.round(mainX)},${Math.round(endY)}`
    for (let i = start + 1; i < end; i++) {
      commits += circlePath(branchX, top + i * step, 12)
    }
  }

  return (
    `<path d="${lines}" fill="none" class="wt-stroke-c1" stroke-width="8" stroke-linecap="round"/>` +
    `<path d="${commits}" class="wt-fill-c2 wt-stroke-shade" stroke-width="5"/>`
  )
}

// Símbolos de programação desenhados com linhas (centro em 0,0).
const SYMBOLS = [
  // </>
  'M-45,-55L-100,0L-45,55M45,-55L100,0L45,55M22,-75L-22,75',
  // { }
  'M-40,-75C-75,-75-60,-25-60,-12S-75,0-85,0C-75,0-60,0-60,12S-75,75-40,75' +
    'M40,-75C75,-75 60,-25 60,-12S75,0 85,0C75,0 60,0 60,12S75,75 40,75',
  // ( )
  'M-30,-80C-80,-40-80,40-30,80M30,-80C80,-40 80,40 30,80',
  // [ ]
  'M-40,-75H-70V75H-40M40,-75H70V75H40',
  // =>
  'M-80,-20H10M-80,20H10M30,-45L80,0L30,45',
  // #
  'M-30,-70L-45,70M30,-70L15,70M-70,-25H65M-75,25H60',
  // //
  'M-10,-70L-50,70M50,-70L10,70',
]

function symbol(rand, [x, y]) {
  const scale = rand.range(0.7, 1.7).toFixed(2)
  const opacity = rand.range(0.3, 0.6).toFixed(2)
  return `<path d="${rand.pick(SYMBOLS)}" class="${rand.pick(STROKE_CLASSES)}" opacity="${opacity}" transform="translate(${Math.round(x)} ${Math.round(y)}) scale(${scale})"/>`
}
