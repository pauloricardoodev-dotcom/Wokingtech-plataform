import { COLOR_CLASSES, circlePath, focusPosition, pickPosition, round, starPath } from './helpers.js'

// Tema "nerd" (cultura pop): coisas de filme, série e quadrinho, desenhadas
// de forma genérica (sem personagens de verdade).
// Elemento principal sorteado: robô, disco voador, TV retrô, espadas laser ou emblema de herói.
// Extras sorteados: explosão e balão de quadrinho, pipoca, óculos 3D, fita VHS, cubo mágico, máscara.
// Variante do fundo: retícula de gibi, linhas de ação ou liso.
export function nerd(rand, { intensity, softness, textArea }) {
  const focus = focusPosition(rand, textArea)
  const main = rand.pick([robot, ufo, retroTv, laserSwords, heroEmblem])

  // Sorteia de 2 a 4 extras diferentes (mais intensidade = mais extras).
  const options = [comicBurst, speechBubble, popcorn, glasses3d, vhsTape, puzzleCube, heroMask]
  let extras = ''
  for (let i = 2 + Math.round(intensity * 2); i > 0 && options.length; i--) {
    const draw = options.splice(rand.int(0, options.length - 1), 1)[0]
    extras += draw(rand, pickPosition(rand, textArea))
  }

  const background = rand.pick(['halftone', 'action', 'none'])
  return {
    defs:
      `<filter id="wt-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${round(8 + softness * 16)}" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
      `<pattern id="wt-halftone" width="26" height="26" patternUnits="userSpaceOnUse">` +
      `<circle cx="6" cy="6" r="4" class="wt-fill-c1" opacity="0.18"/><circle cx="19" cy="19" r="4" class="wt-fill-c1" opacity="0.18"/></pattern>`,
    body:
      (background === 'halftone' ? `<rect width="100%" height="100%" fill="url(#wt-halftone)"/>` : '') +
      (background === 'action' ? actionLines(rand, focus) : '') +
      extras +
      main(rand, focus),
  }
}

// Linhas de ação de gibi: raios saindo do elemento principal.
function actionLines(rand, [cx, cy]) {
  let d = ''
  for (let i = 0; i < 40; i++) {
    const a = rand.range(0, Math.PI * 2)
    const start = rand.range(280, 420)
    const end = start + rand.range(300, 900)
    d += `M${Math.round(cx + Math.cos(a) * start)},${Math.round(cy + Math.sin(a) * start)}L${Math.round(cx + Math.cos(a) * end)},${Math.round(cy + Math.sin(a) * end)}`
  }
  return `<path d="${d}" class="wt-stroke-c1" stroke-width="6" stroke-linecap="round" opacity="0.15"/>`
}

// ---------- Elementos principais (desenhados em volta de 0,0) ----------

// Robô: cabeça com antena, olhos brilhando, boca de grade e parafusos.
function robot(rand, [cx, cy]) {
  const eye = rand.pick(['wt-fill-c2', 'wt-fill-c1'])
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-10, 10)}) scale(${round(rand.range(1, 1.3))})">` +
    `<path d="M0,-190V-150" class="wt-stroke-shade" stroke-width="10"/>` +
    `<path d="${circlePath(0, -200, 18)}" class="wt-fill-c2" filter="url(#wt-glow)"/>` +
    // orelhas
    `<rect x="-205" y="-60" width="40" height="110" rx="14" class="wt-fill-c3 wt-stroke-shade" stroke-width="6"/>` +
    `<rect x="165" y="-60" width="40" height="110" rx="14" class="wt-fill-c3 wt-stroke-shade" stroke-width="6"/>` +
    // cabeça
    `<rect x="-170" y="-150" width="340" height="280" rx="50" class="wt-fill-c1 wt-stroke-shade" stroke-width="8"/>` +
    `<rect x="-130" y="-110" width="260" height="120" rx="30" class="wt-fill-shade"/>` +
    // olhos
    `<path d="${circlePath(-60, -50, 34)}${circlePath(60, -50, 34)}" class="${eye}" filter="url(#wt-glow)"/>` +
    `<path d="${circlePath(-50, -60, 9)}${circlePath(70, -60, 9)}" class="wt-fill-bg" opacity="0.6"/>` +
    // boca de grade
    `<rect x="-80" y="45" width="160" height="50" rx="12" class="wt-fill-shade"/>` +
    `<path d="M-48,45V95M-16,45V95M16,45V95M48,45V95" class="wt-stroke-c2" stroke-width="6"/>` +
    // parafusos nos cantos
    `<path d="${circlePath(-145, -125, 9)}${circlePath(145, -125, 9)}${circlePath(-145, 105, 9)}${circlePath(145, 105, 9)}" class="wt-fill-shade"/>` +
    `</g>`
  )
}

// Disco voador com cúpula, luzes e raio de luz embaixo.
function ufo(rand, [cx, cy]) {
  let lights = ''
  for (let i = -3; i <= 3; i++) lights += circlePath(i * 55, 10, 12)
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy - 60)}) rotate(${rand.int(-12, 12)}) scale(${round(rand.range(1, 1.3))})">` +
    `<path d="M-80,40L-200,380H200L80,40Z" class="wt-fill-c2" opacity="0.18" filter="url(#wt-glow)"/>` +
    `<path d="M-110,-20A110,100 0 0 1 110,-20Z" class="wt-fill-c2" opacity="0.55"/>` +
    `<path d="M-60,-70A60,40 0 0 1 10,-95" fill="none" class="wt-stroke-bg" stroke-width="10" stroke-linecap="round" opacity="0.5"/>` +
    `<ellipse rx="240" ry="62" class="wt-fill-c1 wt-stroke-shade" stroke-width="8"/>` +
    `<ellipse cy="-12" rx="200" ry="24" class="wt-fill-shade" opacity="0.25"/>` +
    `<path d="${lights}" class="wt-fill-c2" filter="url(#wt-glow)"/>` +
    `</g>`
  )
}

// TV retrô: antena em V, tela com linhas e reflexo, botões e perninhas.
function retroTv(rand, [cx, cy]) {
  let scanlines = ''
  for (let y = -100; y < 90; y += 14) scanlines += `M-170,${y}H90`
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-8, 8)}) scale(${round(rand.range(1, 1.25))})">` +
    `<path d="M-20,-150L-110,-260M20,-150L100,-250" class="wt-stroke-shade" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="${circlePath(-110, -260, 14)}${circlePath(100, -250, 14)}" class="wt-fill-c2"/>` +
    `<path d="M-200,150L-230,220M200,150L230,220" class="wt-stroke-shade" stroke-width="16" stroke-linecap="round"/>` +
    `<rect x="-260" y="-150" width="520" height="310" rx="40" class="wt-fill-c1 wt-stroke-shade" stroke-width="8"/>` +
    `<rect x="-215" y="-115" width="330" height="240" rx="50" class="wt-fill-shade"/>` +
    `<path d="${scanlines}" class="wt-stroke-c2" stroke-width="3" opacity="0.15"/>` +
    `<path d="M-180,-60Q-170,-95-130,-100" fill="none" class="wt-stroke-c2" stroke-width="12" stroke-linecap="round" opacity="0.5"/>` +
    `<path d="${circlePath(185, -70, 26)}${circlePath(185, 5, 26)}" class="wt-fill-c3 wt-stroke-shade" stroke-width="6"/>` +
    `<path d="M150,60h70M150,82h70M150,104h70" class="wt-stroke-shade" stroke-width="6" stroke-linecap="round"/>` +
    `</g>`
  )
}

// Duas espadas laser cruzadas, com cabo detalhado e lâmina brilhando.
function laserSwords(rand, [cx, cy]) {
  const sword = (angle, blade) =>
    `<g transform="rotate(${angle})">` +
    `<rect x="-16" y="-380" width="32" height="330" rx="16" class="${blade}" filter="url(#wt-glow)"/>` +
    `<rect x="-7" y="-370" width="14" height="310" rx="7" class="wt-fill-bg" opacity="0.5"/>` +
    `<rect x="-26" y="-60" width="52" height="150" rx="10" class="wt-fill-shade wt-stroke-c2" stroke-width="4"/>` +
    `<path d="M-26,-30H26M-26,0H26M-26,30H26" class="wt-stroke-c2" stroke-width="5"/>` +
    `<rect x="-34" y="-70" width="68" height="18" rx="6" class="wt-fill-c3"/></g>`
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy + 120)})">` +
    sword(-28, 'wt-fill-c1') + sword(28, 'wt-fill-c2') + `</g>`
  )
}

// Emblema de herói: escudo com borda dupla e uma estrela no meio.
function heroEmblem(rand, [cx, cy]) {
  const shield = 'M0,-200L170,-130V0C170,110 90,180 0,220C-90,180-170,110-170,0V-130Z'
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) scale(${round(rand.range(1, 1.25))})">` +
    // "capa" atrás do escudo
    `<path d="M-120,-150L-260,240L-60,160ZM120,-150L260,240L60,160Z" class="wt-fill-c3" opacity="0.8"/>` +
    `<path d="${shield}" class="wt-fill-c1 wt-stroke-shade" stroke-width="10"/>` +
    `<path d="${shield}" fill="none" class="wt-stroke-c2" stroke-width="8" transform="scale(0.82)"/>` +
    `<path d="${starPath(0, 5, 95)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="8" stroke-linejoin="round"/>` +
    `</g>`
  )
}

// ---------- Extras ----------

// "POW!" sem letras: explosão de quadrinho com várias pontas.
function comicBurst(rand, [x, y]) {
  const r = rand.range(90, 150)
  return (
    `<path d="${starPath(x, y, r, r * 0.68, 14)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="8" stroke-linejoin="round"/>` +
    `<path d="${starPath(x, y, r * 0.62, r * 0.45, 14)}" class="wt-fill-c1"/>`
  )
}

// Balão de fala com "..." dentro.
function speechBubble(rand, [x, y]) {
  const w = rand.range(130, 180)
  const dots = circlePath(x - 45, y, 13) + circlePath(x, y, 13) + circlePath(x + 45, y, 13)
  return (
    `<path d="M${Math.round(x - 30)},${Math.round(y + 50)}L${Math.round(x - 70)},${Math.round(y + 120)}L${Math.round(x + 10)},${Math.round(y + 60)}Z" class="wt-fill-c2 wt-stroke-shade" stroke-width="7" stroke-linejoin="round"/>` +
    `<ellipse cx="${Math.round(x)}" cy="${Math.round(y)}" rx="${Math.round(w)}" ry="${Math.round(w * 0.55)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="7"/>` +
    `<path d="${dots}" class="wt-fill-shade"/>`
  )
}

// Balde de pipoca listrado.
function popcorn(rand, [cx, cy]) {
  let puffs = ''
  for (let i = 0; i < 9; i++) puffs += circlePath(-75 + i * 19 + rand.range(-6, 6), -90 + rand.range(-30, 10), rand.range(24, 32))
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-12, 12)})">` +
    `<path d="${puffs}" class="wt-fill-c2 wt-stroke-shade" stroke-width="5"/>` +
    `<path d="M-100,-80H100L75,110H-75Z" class="wt-fill-bg wt-stroke-shade" stroke-width="7" stroke-linejoin="round"/>` +
    `<path d="M-60,-80L-45,110H-15L-25,-80ZM25,-80L15,110H45L60,-80Z" class="wt-fill-c1"/>` +
    `</g>`
  )
}

// Óculos 3D: uma lente de cada cor.
function glasses3d(rand, [cx, cy]) {
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-15, 15)})">` +
    `<path d="M-150,-10L-200,-40M150,-10L200,-40" class="wt-stroke-shade" stroke-width="10" stroke-linecap="round"/>` +
    `<rect x="-160" y="-50" width="320" height="100" rx="20" class="wt-fill-shade"/>` +
    `<rect x="-140" y="-34" width="120" height="68" rx="12" class="wt-fill-c1" opacity="0.9"/>` +
    `<rect x="20" y="-34" width="120" height="68" rx="12" class="wt-fill-c2" opacity="0.9"/></g>`
  )
}

// Fita VHS: caixa, etiqueta e janelinha com os dois rolos.
function vhsTape(rand, [cx, cy]) {
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-20, 20)})">` +
    `<rect x="-170" y="-95" width="340" height="190" rx="12" class="wt-fill-shade wt-stroke-c1" stroke-width="5"/>` +
    `<rect x="-130" y="-75" width="260" height="55" rx="6" class="wt-fill-c2"/>` +
    `<path d="M-110,-55H60M-110,-38H20" class="wt-stroke-shade" stroke-width="6" stroke-linecap="round" opacity="0.5"/>` +
    `<rect x="-110" y="5" width="220" height="65" rx="10" class="wt-fill-bg" opacity="0.6"/>` +
    `<path d="${circlePath(-55, 37, 24)}${circlePath(55, 37, 24)}" class="wt-fill-c3"/></g>`
  )
}

// Cubo mágico em perspectiva: 3 faces com 3×3 quadradinhos coloridos.
function puzzleCube(rand, [cx, cy]) {
  const size = rand.range(90, 130)
  const right = [Math.cos(Math.PI / 6) * size, Math.sin(Math.PI / 6) * size]
  const left = [-right[0], right[1]]
  const down = [0, size]
  const top = [cx, cy - size]
  const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k]
  // cada face: ponto de partida e as duas direções que ela ocupa
  const faces = [
    { start: top, u: right, v: left, shade: 0 },
    { start: add(top, left), u: right, v: down, shade: 0.15 },
    { start: add(top, right), u: left, v: down, shade: 0.3 },
  ]

  let tiles = ''
  for (const face of faces) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const a = add(add(face.start, face.u, i / 3), face.v, j / 3)
        const b = add(a, face.u, 1 / 3)
        const c = add(b, face.v, 1 / 3)
        const d = add(a, face.v, 1 / 3)
        const p = ([x, y]) => `${Math.round(x)},${Math.round(y)}`
        tiles += `<path d="M${p(a)}L${p(b)}L${p(c)}L${p(d)}Z" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="7" stroke-linejoin="round"/>`
      }
    }
    if (face.shade) {
      const p = ([x, y]) => `${Math.round(x)},${Math.round(y)}`
      const corners = [face.start, add(face.start, face.u), add(add(face.start, face.u), face.v), add(face.start, face.v)]
      tiles += `<path d="M${corners.map(p).join('L')}Z" class="wt-fill-shade" opacity="${face.shade}"/>`
    }
  }
  return tiles
}

// Máscara de herói (tipo "dominó") com os furos dos olhos.
function heroMask(rand, [cx, cy]) {
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-15, 15)})">` +
    `<path d="M-170,-20C-150,-80-60,-70 0,-40C60,-70 150,-80 170,-20C175,40 120,70 60,50C30,40 10,20 0,20C-10,20-30,40-60,50C-120,70-175,40-170,-20Z" class="wt-fill-c1 wt-stroke-shade" stroke-width="8"/>` +
    `<path d="M-120,-10C-110,-35-70,-35-55,-10C-70,10-105,10-120,-10ZM120,-10C110,-35 70,-35 55,-10C70,10 105,10 120,-10Z" class="wt-fill-bg"/>` +
    `</g>`
  )
}
