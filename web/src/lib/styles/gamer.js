import {
  COLOR_CLASSES, HEIGHT, WIDTH,
  circlePath, focusPosition, pickPosition, pixelArt, round,
} from './helpers.js'

// Tema "gamer / geek": personagens em pixel art, controle de videogame,
// dado de RPG de 20 lados, barra de vida, moedas e bloco "?".
// Variante sorteada do fundo: linhas de TV antiga, grade de pixels ou estrelas.
export function gamer(rand, { intensity, softness, textArea }) {
  let sprites = ''
  for (let i = 4 + Math.round(intensity * 8); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    const sprite = rand.pick(SPRITES)
    const size = rand.int(7, 14)
    sprites += `<path d="${pixelArt(sprite, x, y, size)}" class="${rand.pick(COLOR_CLASSES)}"/>`
  }

  const main = rand.pick([controller, controller, d20])
  const extras = [healthBar, coins, questionBlock, pixelClouds, brickPlatform, sparkles]
    .filter(() => rand.chance(0.5))
    .map((draw) => draw(rand, textArea))
    .join('')

  const background = rand.pick(['scanlines', 'pixels', 'stars'])
  return {
    defs:
      backgroundPattern(background) +
      `<filter id="wt-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${round(2 + softness * 10)}" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      (background === 'stars' ? starField(rand) : `<rect width="100%" height="100%" fill="url(#wt-retro)"/>`) +
      `<g filter="url(#wt-glow)">${sprites}</g>` +
      main(rand, focusPosition(rand, textArea)) +
      extras,
  }
}

// Desenhos em pixel art ("X" = pixel pintado).
const SPRITES = [
  // invasor espacial
  ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'],
  // fantasminha
  ['...XXXX...', '.XXXXXXXX.', 'XXXXXXXXXX', 'XX..XX..XX', 'XX..XX..XX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'XXXXXXXXXX', 'X.XX..XX.X'],
  // cogumelo
  ['..XXXX..', '.XX..XX.', 'XXXXXXXX', 'X..XX..X', 'XXXXXXXX', '..X..X..', '..XXXX..', '..XXXX..'],
  // coração
  ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
  // espada
  ['......XX', '.....XXX', '....XXX.', '.X.XXX..', '..XXX...', '..XX....', '.X..X...', 'X.......'],
  // estrela
  ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', 'X.....X'],
]
const HEART = SPRITES[3]
const COIN = ['..XX..', '.XXXX.', 'XX..XX', 'XX.XXX', 'XX.XXX', 'XX..XX', '.XXXX.', '..XX..']
const QUESTION_BLOCK = ['XXXXXXXX', 'XXX..XXX', 'XX.XX.XX', 'XXXXX.XX', 'XXXX.XXX', 'XXXXXXXX', 'XXXX.XXX', 'XXXXXXXX']

function backgroundPattern(kind) {
  if (kind === 'stars') return ''
  const tile =
    kind === 'scanlines'
      ? `<rect width="8" height="3" class="wt-fill-c1" opacity="0.08"/>`
      : `<path d="M24,0V24H0" fill="none" class="wt-stroke-c1" stroke-width="1.5" opacity="0.12"/>`
  const size = kind === 'scanlines' ? 'width="8" height="8"' : 'width="24" height="24"'
  return `<pattern id="wt-retro" ${size} patternUnits="userSpaceOnUse">${tile}</pattern>`
}

// Estrelas quadradinhas, como nos jogos antigos.
function starField(rand) {
  let d = ''
  for (let i = rand.int(40, 70); i > 0; i--) {
    const size = rand.pick([4, 4, 6, 8])
    d += `M${Math.round(rand.range(0, WIDTH))},${Math.round(rand.range(0, HEIGHT))}h${size}v${size}h${-size}Z`
  }
  return `<path d="${d}" class="wt-fill-detail" opacity="0.6"/>`
}

// Controle de videogame: corpo com duas "alças", direcional e quatro botões.
function controller(rand, [cx, cy]) {
  const angle = rand.int(-20, 20)
  const buttons = ['wt-fill-c1', 'wt-fill-c2', 'wt-fill-c3', 'wt-fill-c2']
  // símbolo dentro de cada botão: triângulo, círculo, "x" e quadrado
  const symbols = [
    (x, y) => `M${x},${y - 8}L${x + 8},${y + 6}H${x - 8}Z`,
    (x, y) => circlePath(x, y, 7),
    (x, y) => `M${x - 6},${y - 6}L${x + 6},${y + 6}M${x + 6},${y - 6}L${x - 6},${y + 6}`,
    (x, y) => `M${x - 6},${y - 6}h12v12h-12Z`,
  ]
  let buttonDots = ''
  let buttonSymbols = ''
  const spots = [[0, -32], [32, 0], [0, 32], [-32, 0]]
  spots.forEach(([dx, dy], i) => {
    buttonDots += `<path d="${circlePath(150 + dx, dy, 18)}" class="${buttons[i]} wt-stroke-shade" stroke-width="3"/>`
    buttonSymbols += symbols[i](150 + dx, dy)
  })
  // alavancas analógicas: base escura + topo com anel
  const stick = (x) =>
    `<path d="${circlePath(x, 45, 34)}" class="wt-fill-bg" opacity="0.5"/>` +
    `<path d="${circlePath(x, 45, 24)}" class="wt-fill-c3 wt-stroke-shade" stroke-width="4"/>` +
    `<path d="${circlePath(x, 45, 12)}" fill="none" class="wt-stroke-shade" stroke-width="3" opacity="0.5"/>`
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${angle}) scale(${round(rand.range(0.9, 1.3))})">` +
    // botões de ombro (atrás do corpo)
    `<rect x="-230" y="-135" width="130" height="50" rx="20" class="wt-fill-c3 wt-stroke-shade" stroke-width="5"/>` +
    `<rect x="100" y="-135" width="130" height="50" rx="20" class="wt-fill-c3 wt-stroke-shade" stroke-width="5"/>` +
    // corpo: duas alças redondas + retângulo arredondado por cima.
    // O retângulo é desenhado de novo sem contorno para "apagar" as linhas
    // onde as alças encostam nele (fica um contorno só, por fora).
    `<path d="${circlePath(-160, 50, 95)}${circlePath(160, 50, 95)}" class="wt-fill-shade wt-stroke-c1" stroke-width="6"/>` +
    `<rect x="-250" y="-110" width="500" height="200" rx="100" class="wt-fill-shade wt-stroke-c1" stroke-width="6"/>` +
    `<rect x="-247" y="-107" width="494" height="194" rx="97" class="wt-fill-shade"/>` +
    `<path d="${circlePath(-160, 50, 92)}${circlePath(160, 50, 92)}" class="wt-fill-shade"/>` +
    // direcional em cruz, com setinhas
    `<path d="M-175,-50h30v35h35v30h-35v35h-30v-35h-35v-30h35Z" class="wt-fill-c2 wt-stroke-shade" stroke-width="3"/>` +
    `<path d="M-160,-42l-7,10h14ZM-160,42l-7,-10h14ZM-202,0l10,-7v14ZM-118,0l-10,-7v14Z" class="wt-fill-shade" opacity="0.6"/>` +
    buttonDots +
    `<path d="${buttonSymbols}" fill="none" class="wt-stroke-shade" stroke-width="3" stroke-linejoin="round"/>` +
    stick(-75) + stick(75) +
    // start e select, e a luzinha de ligado
    `<rect x="-50" y="-40" width="40" height="14" rx="7" class="wt-fill-c1"/><rect x="10" y="-40" width="40" height="14" rx="7" class="wt-fill-c1"/>` +
    `<path d="${circlePath(0, -80, 7)}" class="wt-fill-c2" filter="url(#wt-glow)"/>` +
    `</g>`
  )
}

// Dado de 20 lados (D20) visto de frente: hexágono com triângulos dentro.
function d20(rand, [cx, cy]) {
  const r = rand.range(150, 220)
  const outer = []
  for (let i = 0; i < 6; i++) {
    const a = ((i * 60 - 90) * Math.PI) / 180
    outer.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  const inner = []
  for (let i = 0; i < 3; i++) {
    const a = ((i * 120 + 90) * Math.PI) / 180
    inner.push([cx + Math.cos(a) * r * 0.55, cy - Math.sin(a) * r * 0.55])
  }
  const p = ([x, y]) => `${Math.round(x)},${Math.round(y)}`
  const hexagon = 'M' + outer.map(p).join('L') + 'Z'
  const triangle = 'M' + inner.map(p).join('L') + 'Z'
  // linhas ligando cada ponta do triângulo do meio aos 3 cantos mais próximos
  // (hexágono: 0 = topo, depois em sentido horário; triângulo: 0 = topo,
  // 1 = embaixo à esquerda, 2 = embaixo à direita)
  let edges = ''
  const links = [[0, 5], [0, 0], [0, 1], [1, 3], [1, 4], [1, 5], [2, 1], [2, 2], [2, 3]]
  for (const [i, o] of links) edges += `M${p(inner[i])}L${p(outer[o])}`
  return (
    `<path d="${hexagon}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="8" stroke-linejoin="round"/>` +
    `<path d="${triangle}" class="wt-fill-bg" opacity="0.25"/>` +
    `<path d="${triangle}${edges}" fill="none" class="wt-stroke-shade" stroke-width="6" stroke-linejoin="round"/>`
  )
}

// Barra de vida: coraçõezinhos no canto de cima à direita (os últimos "vazios").
function healthBar(rand) {
  const size = 8
  const total = rand.int(3, 5)
  const full = rand.int(1, total)
  const startX = WIDTH - 80 - total * 70
  let filled = ''
  let empty = ''
  for (let i = 0; i < total; i++) {
    const heart = pixelArt(HEART, startX + i * 70, 60, size)
    if (i < full) filled += heart
    else empty += heart
  }
  return `<path d="${filled}" class="wt-fill-c1"/><path d="${empty}" class="wt-fill-c1" opacity="0.25"/>`
}

function coins(rand, textArea) {
  const [x, y] = pickPosition(rand, textArea)
  let d = ''
  for (let i = rand.int(3, 5); i > 0; i--) d += pixelArt(COIN, x + i * 70, y, 8)
  return `<path d="${d}" class="wt-fill-c2"/>`
}

// Nuvens quadradonas, como nos jogos de plataforma.
const CLOUD = ['...XXX......', '..XXXXX.XX..', '.XXXXXXXXXX.', 'XXXXXXXXXXXX', '.XXXXXXXXXX.']
function pixelClouds(rand, textArea) {
  let d = ''
  for (let i = rand.int(2, 3); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    d += pixelArt(CLOUD, x, Math.min(y, HEIGHT * 0.4), 12)
  }
  return `<path d="${d}" class="wt-fill-c2" opacity="0.35"/>`
}

// Plataforma de tijolos no rodapé, com rejunte entre os blocos.
function brickPlatform(rand, textArea) {
  const startX = textArea === 'center' ? 0 : WIDTH * 0.45
  const top = HEIGHT - 96
  let mortar = ''
  for (let row = 0; row < 2; row++) {
    const y = top + row * 48
    mortar += `M${Math.round(startX)},${y}H${WIDTH}`
    for (let x = startX - (row % 2) * 48; x < WIDTH; x += 96) mortar += `M${Math.round(x)},${y}v48`
  }
  return (
    `<rect x="${Math.round(startX)}" y="${top}" width="${Math.round(WIDTH - startX)}" height="96" class="${rand.pick(['wt-fill-c3', 'wt-fill-c1'])}"/>` +
    `<path d="${mortar}" class="wt-stroke-shade" stroke-width="6"/>`
  )
}

// Brilhinhos em cruz (de power-up), em pixel art.
const SPARKLE = ['..X..', '..X..', 'XX.XX', '..X..', '..X..']
function sparkles(rand, textArea) {
  let d = ''
  for (let i = rand.int(4, 8); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    d += pixelArt(SPARKLE, x, y, rand.pick([5, 6, 8]))
  }
  return `<path d="${d}" class="wt-fill-detail" filter="url(#wt-glow)"/>`
}

function questionBlock(rand, textArea) {
  const [x, y] = pickPosition(rand, textArea)
  return `<path d="${pixelArt(QUESTION_BLOCK, x, y, 14)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="1"/>`
}
