import { HEIGHT, WIDTH, circlePath, cloudPath, ridge, ridgePath, round } from './helpers.js'

// Estilo "aurora": faixas de luz ondulando no céu.
// Cada faixa é desenhada duas vezes: com degradê (a cor) e com listras
// verticais (a textura de "cortina" típica da aurora boreal).
// Variante sorteada do chão: montanhas, pinheiros ou lago refletindo.
// Tema escuro = noite (lua, estrelas, estrela cadente); claro = dia (sol e nuvens).
export function aurora(rand, { intensity, softness, textArea, theme }) {
  // O céu de dia/noite usa um sorteador próprio: assim trocar o tema
  // não muda o resto do desenho (faixas e chão continuam iguais).
  const celestialRand = rand.fork()
  const totalRibbons = 2 + Math.round(intensity * 3)

  let ribbons = ''
  for (let i = 0; i < totalRibbons; i++) {
    const d = ribbonPath(rand)
    const gradient = rand.pick(['wt-aurora-1', 'wt-aurora-2'])
    ribbons += `<path d="${d}" fill="url(#${gradient})"/><path d="${d}" fill="url(#wt-curtain)" opacity="0.35"/>`
  }

  const sky = `<g filter="url(#wt-blur)">${ribbons}</g>`
  const ground = rand.pick(['mountains', 'pines', 'lake'])

  return {
    defs:
      auroraGradient('wt-aurora-1', 'c1', 'c2') +
      auroraGradient('wt-aurora-2', 'c2', 'c3') +
      `<pattern id="wt-curtain" width="18" height="40" patternUnits="userSpaceOnUse"><rect width="5" height="40" class="wt-fill-c2"/></pattern>` +
      `<filter id="wt-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="${round(6 + softness * 24)}"/></filter>` +
      `<filter id="wt-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      (theme === 'light' ? daySky(celestialRand, textArea) : nightSky(celestialRand, textArea)) +
      sky +
      (ground === 'lake' ? lake(rand, sky) : '') +
      (ground === 'mountains' ? `<path d="${mountainsPath(rand)}" class="wt-fill-shade"/>` : '') +
      (ground === 'pines' ? `<path d="${pinesPath(rand)}" class="wt-fill-shade"/>` + (rand.chance(0.6) ? cabin(rand, textArea) : '') : ''),
  }
}

// Noite: estrelas, às vezes lua e estrela cadente.
function nightSky(rand, textArea) {
  return (
    stars(rand) +
    (rand.chance(0.6) ? moon(rand, textArea) : '') +
    (rand.chance(0.5) ? shootingStar(rand) : '')
  )
}

// Dia: sol com halo e nuvens fofinhas.
function daySky(rand, textArea) {
  const [x, y] = skyCorner(rand, textArea)
  const r = rand.range(55, 85)
  let clouds = ''
  for (let i = rand.int(3, 5); i > 0; i--) {
    clouds += cloudPath(rand.range(0, WIDTH - 300), rand.range(HEIGHT * 0.12, HEIGHT * 0.45), rand.range(160, 300))
  }
  return (
    `<path d="${circlePath(x, y, r * 1.6)}" class="wt-fill-c1" opacity="0.18"/>` +
    `<path d="${circlePath(x, y, r)}" class="wt-fill-c1"/>` +
    `<path d="${clouds}" class="wt-fill-c2" opacity="0.45"/>`
  )
}

// Canto do céu longe do texto (para sol e lua).
function skyCorner(rand, textArea) {
  const x = textArea === 'center' ? rand.pick([0.12, 0.88]) * WIDTH : rand.range(0.7, 0.88) * WIDTH
  return [x, rand.range(0.1, 0.22) * HEIGHT]
}

// Lua crescente: um círculo "mordido" por outro da cor do fundo.
function moon(rand, textArea) {
  const [x, y] = skyCorner(rand, textArea)
  const r = rand.range(40, 65)
  return (
    `<path d="${circlePath(x, y, r)}" class="wt-fill-detail" filter="url(#wt-glow)"/>` +
    `<path d="${circlePath(x + r * 0.4, y - r * 0.2, r * 0.85)}" class="wt-fill-bg"/>`
  )
}

// Estrela cadente: risco que vai afinando, com uma pontinha brilhante.
function shootingStar(rand) {
  const x = Math.round(rand.range(WIDTH * 0.4, WIDTH * 0.95))
  const y = Math.round(rand.range(40, HEIGHT * 0.3))
  return (
    `<g transform="translate(${x} ${y}) rotate(${rand.int(150, 170)})" filter="url(#wt-glow)">` +
    `<path d="M0,-3L260,0L0,3Z" class="wt-fill-detail" opacity="0.6"/>` +
    `<path d="${circlePath(0, 0, 5)}" class="wt-fill-detail"/></g>`
  )
}

// Cabaninha no meio dos pinheiros, com a janela acesa.
function cabin(rand, textArea) {
  const x = Math.round(textArea === 'center' ? rand.pick([0.15, 0.85]) * WIDTH : rand.range(0.62, 0.85) * WIDTH)
  const y = Math.round(HEIGHT * 0.9)
  return (
    // paredes numa cor da paleta (senão a cabana some no meio dos pinheiros escuros)
    `<path d="M${x - 60},${y}V${y - 80}H${x + 60}V${y}Z" class="wt-fill-c3"/>` +
    `<path d="M${x + 30},${y - 120}h22v-40h-22Z" class="wt-fill-shade"/>` +
    `<path d="M${x - 80},${y - 76}L${x},${y - 145}L${x + 80},${y - 76}Z" class="wt-fill-shade wt-stroke-c3" stroke-width="4" stroke-linejoin="round"/>` +
    `<rect x="${x - 22}" y="${y - 70}" width="44" height="36" class="wt-fill-c2" filter="url(#wt-glow)"/>` +
    `<path d="M${x},${y - 70}V${y - 34}M${x - 22},${y - 52}H${x + 22}" class="wt-stroke-shade" stroke-width="4"/>`
  )
}

// Degradê vertical: some em cima, forte no meio, some embaixo.
function auroraGradient(id, top, core) {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" class="wt-stop-${top}" stop-opacity="0"/>` +
    `<stop offset="0.45" class="wt-stop-${top}" stop-opacity="0.7"/>` +
    `<stop offset="0.8" class="wt-stop-${core}" stop-opacity="0.9"/>` +
    `<stop offset="1" class="wt-stop-${core}" stop-opacity="0"/></linearGradient>`
  )
}

// Uma faixa: borda de cima ondulada e borda de baixo seguindo a de cima.
function ribbonPath(rand) {
  const topAt = ridge(rand, HEIGHT * rand.range(0.08, 0.35), rand.range(60, 140))
  const thickness = rand.range(160, 320)
  let top = ''
  let bottom = ''
  for (let x = -40; x <= WIDTH + 40; x += 40) {
    top += `L${x},${Math.round(topAt(x))}`
    bottom = `L${x},${Math.round(topAt(x) + thickness + Math.sin(x / 140) * 30)}` + bottom
  }
  return 'M' + top.slice(1) + bottom + 'Z'
}

// Estrelas: muitas bolinhas e algumas "cintilando" em forma de cruz.
function stars(rand) {
  let d = ''
  for (let i = rand.int(40, 80); i > 0; i--) {
    d += circlePath(rand.range(0, WIDTH), rand.range(0, HEIGHT * 0.75), rand.range(1.5, 3.5))
  }
  let twinkles = ''
  for (let i = rand.int(4, 8); i > 0; i--) {
    const x = Math.round(rand.range(0, WIDTH))
    const y = Math.round(rand.range(0, HEIGHT * 0.6))
    const s = Math.round(rand.range(8, 16))
    twinkles += `M${x - s},${y}H${x + s}M${x},${y - s}V${y + s}`
  }
  return (
    `<path d="${d}" class="wt-fill-detail" opacity="0.8"/>` +
    `<path d="${twinkles}" class="wt-stroke-detail" stroke-width="2.5" stroke-linecap="round"/>`
  )
}

function mountainsPath(rand) {
  let d = `M0,${HEIGHT}L0,${Math.round(HEIGHT * 0.8)}`
  let x = 0
  while (x < WIDTH) {
    x += rand.range(100, 240)
    d += `L${Math.round(x)},${Math.round(HEIGHT * rand.range(0.55, 0.72))}`
    x += rand.range(100, 240)
    d += `L${Math.round(x)},${Math.round(HEIGHT * rand.range(0.75, 0.85))}`
  }
  return d + `L${WIDTH},${HEIGHT}Z`
}

// Morro baixinho com uma fileira de pinheiros (triângulos).
function pinesPath(rand) {
  const heightAt = ridge(rand, HEIGHT * 0.88, 25)
  let d = ridgePath(heightAt)
  let x = rand.range(-20, 20)
  while (x < WIDTH + 30) {
    const base = heightAt(x) + 6
    const height = rand.range(60, 170)
    const half = height * 0.22
    d += `M${Math.round(x - half)},${Math.round(base)}L${Math.round(x)},${Math.round(base - height)}L${Math.round(x + half)},${Math.round(base)}Z`
    x += rand.range(18, 45)
  }
  return d
}

// Lago: a aurora de cabeça para baixo, apagada, embaixo da linha da margem,
// com reflexos de luz tremendo na água.
function lake(rand, sky) {
  const shore = Math.round(HEIGHT * 0.74)
  let shimmer = ''
  for (let i = 0; i < 30; i++) {
    const y = Math.round(rand.range(shore + 20, HEIGHT - 10))
    shimmer += `M${Math.round(rand.range(0, WIDTH))},${y}h${Math.round(rand.range(30, 140))}`
  }
  return (
    `<rect y="${shore}" width="${WIDTH}" height="${HEIGHT - shore}" class="wt-fill-bg"/>` +
    `<g transform="translate(0 ${shore * 2}) scale(1 -1)" opacity="0.3">${sky}</g>` +
    `<path d="${shimmer}" class="wt-stroke-detail" stroke-width="3" stroke-linecap="round" opacity="0.45"/>` +
    `<rect y="${shore - 14}" width="${WIDTH}" height="18" class="wt-fill-shade"/>`
  )
}
