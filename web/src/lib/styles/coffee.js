import { COLOR_CLASSES, circlePath, focusPosition, heartPath, pickPosition, round } from './helpers.js'

// Tema "café".
// Elemento principal sorteado: xícara de lado (com vapor), vista de cima (com latte art)
// ou cafeteira francesa.
// Em volta: grãos de café, manchas de xícara e, às vezes, donut, cookie e cubos de açúcar.
// Variante do fundo: toalha xadrez, bolinhas ou liso.
export function coffee(rand, { intensity, softness, textArea }) {
  const main = rand.pick([sideCup, sideCup, topCup, frenchPress])

  let beans = ''
  for (let i = 4 + Math.round(intensity * 10); i > 0; i--) {
    beans += bean(rand, pickPosition(rand, textArea))
  }

  let stains = ''
  for (let i = rand.int(1, 3); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    stains += circlePath(x, y, rand.range(70, 110))
  }

  const background = rand.pick(['checkered', 'dots', 'none'])
  const tile =
    background === 'checkered'
      ? `<rect width="40" height="40" class="wt-fill-c1" opacity="0.1"/><rect x="40" y="40" width="40" height="40" class="wt-fill-c1" opacity="0.1"/>`
      : `<circle cx="20" cy="20" r="4" class="wt-fill-c2" opacity="0.25"/><circle cx="60" cy="60" r="4" class="wt-fill-c2" opacity="0.25"/>`

  return {
    defs:
      (background === 'none' ? '' : `<pattern id="wt-cloth" width="80" height="80" patternUnits="userSpaceOnUse">${tile}</pattern>`) +
      `<filter id="wt-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(2 + softness * 8)}"/></filter>`,
    body:
      (background === 'none' ? '' : `<rect width="100%" height="100%" fill="url(#wt-cloth)"/>`) +
      `<path d="${stains}" fill="none" class="wt-stroke-c3" stroke-width="10" opacity="0.25" stroke-dasharray="180 40"/>` +
      beans +
      (rand.chance(0.35) ? donut(rand, pickPosition(rand, textArea)) : '') +
      (rand.chance(0.4) ? cookie(rand, pickPosition(rand, textArea)) : '') +
      (rand.chance(0.4) ? sugarCubes(rand, pickPosition(rand, textArea)) : '') +
      main(rand, focusPosition(rand, textArea)),
  }
}

// Xícara de lado, no pires, com vapor subindo.
function sideCup(rand, [cx, cy]) {
  const s = round(rand.range(1.1, 1.5))
  let steam = ''
  for (const dx of [-45, 0, 45]) {
    steam += `M${dx},-90C${dx - 30},-130 ${dx + 30},-160 ${dx},-200S${dx - 25},-250 ${dx},-280`
  }
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) scale(${s})">` +
    `<path d="${steam}" fill="none" class="wt-stroke-c2" stroke-width="10" stroke-linecap="round" opacity="0.6" filter="url(#wt-blur)"/>` +
    `<ellipse cx="0" cy="95" rx="160" ry="24" class="wt-fill-c2 wt-stroke-shade" stroke-width="6"/>` +
    // colherzinha apoiada no pires
    `<path d="M70,98L170,70" class="wt-stroke-shade" stroke-width="8" stroke-linecap="round"/>` +
    `<ellipse cx="60" cy="100" rx="22" ry="11" class="wt-fill-shade" transform="rotate(-15 60 100)"/>` +
    `<path d="${circlePath(105, 0, 38)}" fill="none" class="wt-stroke-shade" stroke-width="18"/>` +
    `<path d="M-100,-70H100L85,50Q78,90 40,90H-40Q-78,90-85,50Z" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6" stroke-linejoin="round"/>` +
    // faixa decorativa e bolinhas na xícara
    `<path d="M-96,-35H96" class="wt-stroke-c2" stroke-width="14" opacity="0.7"/>` +
    `<path d="${circlePath(-50, 20, 7)}${circlePath(0, 30, 7)}${circlePath(50, 20, 7)}" class="wt-fill-bg" opacity="0.4"/>` +
    `<ellipse cx="0" cy="-70" rx="100" ry="16" class="wt-fill-shade"/>` +
    `<path d="M-70,-60Q-75,10-55,60" fill="none" class="wt-stroke-bg" stroke-width="10" stroke-linecap="round" opacity="0.3"/></g>`
  )
}

// Xícara vista de cima: pires, borda, café e um coração de latte art.
function topCup(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  return (
    `<path d="${circlePath(x, y, 190)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="6" opacity="0.9"/>` +
    `<rect x="${x + 110}" y="${y - 22}" width="110" height="44" rx="22" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
    `<path d="${circlePath(x, y, 130)}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
    `<path d="${circlePath(x, y, 105)}" class="wt-fill-shade"/>` +
    `<path d="${heartPath(x, y + 5, 120)}" class="wt-fill-c2" opacity="0.9"/>`
  )
}

// Cafeteira francesa: jarra de vidro com café, êmbolo e alça.
function frenchPress(rand, [cx, cy]) {
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) scale(${round(rand.range(1, 1.3))})">` +
    `<path d="M0,-260V-150" class="wt-stroke-shade" stroke-width="12"/>` +
    `<path d="${circlePath(0, -270, 22)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="6"/>` +
    `<path d="M95,-120H140Q170,-120 170,-90V80Q170,110 140,110H95" fill="none" class="wt-stroke-shade" stroke-width="22" stroke-linejoin="round"/>` +
    `<rect x="-110" y="-150" width="220" height="30" rx="10" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
    `<rect x="-100" y="-120" width="200" height="270" rx="12" class="wt-fill-c2 wt-stroke-shade" stroke-width="6" opacity="0.35"/>` +
    `<rect x="-94" y="-20" width="188" height="164" rx="8" class="wt-fill-shade"/>` +
    `<path d="M-94,-20H94" class="wt-stroke-c2" stroke-width="8" opacity="0.6"/>` +
    `<path d="M-60,-100V120" class="wt-stroke-bg" stroke-width="12" stroke-linecap="round" opacity="0.35"/>` +
    `<rect x="-110" y="150" width="220" height="26" rx="10" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
    `<path d="${circlePath(-30, 40, 6)}${circlePath(25, 80, 5)}${circlePath(-10, 110, 4)}" class="wt-fill-c2" opacity="0.5"/>` +
    `</g>`
  )
}

// Cookie com gotas de chocolate e uma mordida.
function cookie(rand, [cx, cy]) {
  const r = rand.range(55, 80)
  let chips = ''
  for (let i = rand.int(5, 8); i > 0; i--) {
    const a = rand.range(0, Math.PI * 2)
    const d = rand.range(0, r * 0.7)
    chips += circlePath(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rand.range(6, 10))
  }
  // a "mordida" é um círculo da cor do fundo por cima da borda
  const bite = circlePath(cx + r * 0.85, cy - r * 0.55, r * 0.35)
  return (
    `<path d="${circlePath(cx, cy, r)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="5"/>` +
    `<path d="${chips}" class="wt-fill-shade"/>` +
    `<path d="${bite}" class="wt-fill-bg"/>`
  )
}

// Cubos de açúcar em perspectiva (face de cima mais clara).
function sugarCubes(rand, [cx, cy]) {
  let result = ''
  for (let i = rand.int(2, 3); i > 0; i--) {
    const x = Math.round(cx + rand.range(-80, 80))
    const y = Math.round(cy + rand.range(-50, 50))
    result +=
      `<g transform="translate(${x} ${y}) rotate(${rand.int(-20, 20)})">` +
      `<path d="M-30,-15L0,-30L30,-15L0,0Z" class="wt-fill-c2"/>` +
      `<path d="M-30,-15L0,0V35L-30,20Z" class="wt-fill-c2" opacity="0.75"/>` +
      `<path d="M30,-15L0,0V35L30,20Z" class="wt-fill-c2" opacity="0.55"/>` +
      `<path d="M-30,-15L0,-30L30,-15V20L0,35L-30,20Z" fill="none" class="wt-stroke-shade" stroke-width="4" stroke-linejoin="round"/></g>`
  }
  return result
}

// Grão de café: elipse com o "risco" curvo no meio.
function bean(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  const size = rand.range(0.7, 1.3)
  return (
    `<g transform="translate(${x} ${y}) rotate(${rand.int(0, 179)}) scale(${round(size)})">` +
    `<ellipse rx="30" ry="20" class="wt-fill-shade"/>` +
    `<path d="M-24,0C-10,-10 10,10 24,0" fill="none" class="wt-stroke-c2" stroke-width="5" stroke-linecap="round"/></g>`
  )
}

// Donut com cobertura e granulado.
function donut(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  let sprinkles = ''
  for (let i = 0; i < 14; i++) {
    const a = rand.range(0, Math.PI * 2)
    const d = rand.range(42, 70)
    const sx = Math.round(x + Math.cos(a) * d)
    const sy = Math.round(y + Math.sin(a) * d)
    sprinkles += `<rect x="${sx}" y="${sy}" width="14" height="5" rx="2.5" class="${rand.pick(COLOR_CLASSES)}" transform="rotate(${rand.int(0, 179)} ${sx} ${sy})"/>`
  }
  return (
    `<path d="${circlePath(x, y, 95)}${circlePath(x, y, 28)}" fill-rule="evenodd" class="wt-fill-c3 wt-stroke-shade" stroke-width="6"/>` +
    `<path d="${circlePath(x, y, 80)}${circlePath(x, y, 34)}" fill-rule="evenodd" class="wt-fill-c2"/>` +
    sprinkles
  )
}
