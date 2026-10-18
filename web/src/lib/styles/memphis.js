import { COLOR_CLASSES, STROKE_CLASSES, circlePath, pickPosition, round } from './helpers.js'

// Estilo "Memphis" (design dos anos 80/90): formas geométricas soltas,
// rabiscos, zigue-zagues e confete, com contorno escuro.
// Variante sorteada do fundo: liso, pontilhado ou quadriculado.
export function memphis(rand, { intensity, softness, textArea }) {
  const total = 8 + Math.round(intensity * 14)
  const corners = softness > 0.5 ? 'round' : 'miter' // mais suavidade = cantos arredondados

  let shapes = ''
  for (let i = 0; i < total; i++) {
    const [x, y] = pickPosition(rand, textArea).map(Math.round)
    const angle = rand.int(0, 359)
    const draw = rand.pick(SHAPES)
    shapes += `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${round(rand.range(1, 1.9))})">${draw(rand)}</g>`
  }

  const background = rand.pick(['none', 'dots', 'grid'])
  const tile =
    background === 'dots'
      ? `<circle cx="20" cy="20" r="3" class="wt-fill-shade" opacity="0.25"/>`
      : `<path d="M40,0V40H0" fill="none" class="wt-stroke-shade" stroke-width="2" opacity="0.15"/>`

  return {
    defs:
      `<pattern id="wt-stripes" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="7" class="wt-fill-shade"/></pattern>` +
      `<pattern id="wt-dotfill" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="4" class="wt-fill-shade"/></pattern>` +
      (background === 'none' ? '' : `<pattern id="wt-paper" width="40" height="40" patternUnits="userSpaceOnUse">${tile}</pattern>`),
    body:
      (background === 'none' ? '' : `<rect width="100%" height="100%" fill="url(#wt-paper)"/>`) +
      `<g stroke-linecap="round" stroke-linejoin="${corners}">${shapes}</g>`,
  }
}

// Preenchimento com contorno escuro (as duas classes ficam no mesmo atributo).
const outlined = (fillClass) => `class="${fillClass} wt-stroke-shade" stroke-width="7"`

// Cada forma é desenhada em volta do ponto 0,0.
const SHAPES = [
  // rabisco ondulado
  (rand) => `<path d="M-120,0C-90,-50-60,-50-30,0S30,50 60,0S100,-50 120,-20" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="16"/>`,
  // zigue-zague
  (rand) => `<path d="M-110,20L-70,-20L-30,20L10,-20L50,20L90,-20" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="14"/>`,
  // triângulo cheio com contorno
  (rand) => `<path d="M0,-70L65,50H-65Z" ${outlined(rand.pick(COLOR_CLASSES))}/>`,
  // triângulo só contorno
  (rand) => `<path d="M0,-60L55,40H-55Z" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="12"/>`,
  // círculo cheio
  (rand) => `<path d="${circlePath(0, 0, rand.range(35, 70))}" ${outlined(rand.pick(COLOR_CLASSES))}/>`,
  // meia-lua
  (rand) => `<path d="M-70,0A70,70 0 0 1 70,0Z" ${outlined(rand.pick(COLOR_CLASSES))}/>`,
  // círculo listrado
  () => `<path d="${circlePath(0, 0, 60)}" fill="url(#wt-stripes)" ${outlined('')}/>`,
  // sinal de mais
  (rand) => `<path d="M-35,0H35M0,-35V35" class="${rand.pick(STROKE_CLASSES)}" stroke-width="16"/>`,
  // retângulo com sombra deslocada
  (rand) => `<rect x="-40" y="-55" width="90" height="120" class="wt-fill-shade"/><rect x="-55" y="-70" width="90" height="120" ${outlined(rand.pick(COLOR_CLASSES))}/>`,
  // confete: retângulos pequenos espalhados
  (rand) => {
    let pieces = ''
    for (let i = rand.int(5, 9); i > 0; i--) {
      const x = Math.round(rand.range(-90, 90))
      const y = Math.round(rand.range(-70, 70))
      pieces += `<rect x="${x}" y="${y}" width="22" height="9" class="${rand.pick(COLOR_CLASSES)}" transform="rotate(${rand.int(0, 179)} ${x} ${y})"/>`
    }
    return pieces
  },
  // pílula com sombra deslocada
  (rand) =>
    `<rect x="-62" y="-22" width="140" height="56" rx="28" class="wt-fill-shade"/>` +
    `<rect x="-75" y="-35" width="140" height="56" rx="28" ${outlined(rand.pick(COLOR_CLASSES))}/>` +
    `<path d="M-40,-7H30" class="wt-stroke-bg" stroke-width="8" stroke-linecap="round" opacity="0.5"/>`,
  // arco-íris de três faixas
  (rand) => {
    const start = rand.int(0, 2) // começa por uma cor sorteada e segue a ordem
    return [90, 64, 38]
      .map((r, i) => `<path d="M${-r},40A${r},${r} 0 0 1 ${r},40" fill="none" class="${STROKE_CLASSES[(start + i) % 3]}" stroke-width="22"/>`)
      .join('')
  },
  // rabisco com sombra
  (rand) => {
    const d = 'M-110,0C-80,-45-50,-45-20,0S40,45 70,0S110,-40 120,-10'
    return (
      `<path d="${d}" fill="none" class="wt-stroke-shade" stroke-width="18" transform="translate(10 10)"/>` +
      `<path d="${d}" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="18"/>`
    )
  },
  // círculo pontilhado
  () => `<path d="${circlePath(0, 0, 70)}" fill="url(#wt-dotfill)" opacity="0.7"/>`,
  // grade de bolinhas
  (rand) => {
    let d = ''
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) d += circlePath(-80 + col * 40, -60 + row * 40, 6)
    }
    return `<path d="${d}" class="${rand.pick(COLOR_CLASSES)}"/>`
  },
]
