import {
  COLOR_CLASSES, HEIGHT, STROKE_CLASSES, WIDTH,
  circlePath, focusPosition, pickPosition, round,
} from './helpers.js'

// Tema "música".
// Elemento principal sorteado: disco de vinil, fita cassete, caixa de som ou microfone.
// Embaixo: equalizador (barras) ou forma de onda do áudio.
// Extras sorteados: notas musicais, fones de ouvido, pauta, palhetas de guitarra.
export function music(rand, { intensity, softness, textArea }) {
  const main = rand.pick([vinyl, vinyl, cassette, speaker, microphone])
  const sound = rand.chance(0.5) ? equalizer : waveform

  let notes = ''
  for (let i = 3 + Math.round(intensity * 7); i > 0; i--) {
    notes += note(rand, pickPosition(rand, textArea))
  }

  return {
    defs: `<filter id="wt-blur"><feGaussianBlur stdDeviation="${round(softness * 3)}"/></filter>`,
    body:
      (rand.chance(0.35) ? staff(rand) : '') +
      sound(rand, intensity, textArea) +
      main(rand, focusPosition(rand, textArea)) +
      (rand.chance(0.35) ? headphones(rand, pickPosition(rand, textArea)) : '') +
      (rand.chance(0.5) ? guitarPicks(rand, textArea) : '') +
      `<g filter="url(#wt-blur)">${notes}</g>`,
  }
}

// Disco de vinil: sulcos, rótulo no meio, reflexo e (às vezes) o braço da agulha.
function vinyl(rand, [cx, cy]) {
  const r = rand.range(220, 290)
  let grooves = ''
  for (let i = 1; i <= 6; i++) grooves += circlePath(cx, cy, r * (0.4 + i * 0.09))
  const x = Math.round(cx)
  const y = Math.round(cy)
  const shine = `M${Math.round(x - r * 0.75)},${Math.round(y - r * 0.4)}A${Math.round(r * 0.85)},${Math.round(r * 0.85)} 0 0 1 ${Math.round(x - r * 0.3)},${Math.round(y - r * 0.8)}`
  const arm = rand.chance(0.6)
    ? `<path d="M${Math.round(x + r * 0.95)},${Math.round(y - r * 0.95)}L${Math.round(x + r * 0.75)},${Math.round(y - r * 0.1)}L${Math.round(x + r * 0.45)},${Math.round(y + r * 0.15)}" fill="none" class="wt-stroke-c2" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${circlePath(x + r * 0.95, y - r * 0.95, 30)}" class="wt-fill-c2 wt-stroke-shade" stroke-width="6"/>`
    : ''
  return (
    `<path d="${circlePath(cx, cy, r)}" class="wt-fill-shade"/>` +
    `<path d="${grooves}" fill="none" class="wt-stroke-c1" stroke-width="2" opacity="0.25"/>` +
    `<path d="${shine}" fill="none" class="wt-stroke-c2" stroke-width="22" stroke-linecap="round" opacity="0.25"/>` +
    `<path d="${circlePath(cx, cy, r * 0.32)}" class="${rand.pick(COLOR_CLASSES)}"/>` +
    `<path d="${circlePath(cx, cy, r * 0.12)}" class="wt-fill-c2"/>` +
    `<path d="${circlePath(cx, cy, 9)}" class="wt-fill-bg"/>` +
    arm
  )
}

// Fita cassete: corpo, etiqueta, janelinha com dois rolos e parafusos.
function cassette(rand, [cx, cy]) {
  const reel = (x) =>
    `<path d="${circlePath(x, 10, 42)}" class="wt-fill-bg"/>` +
    `<path d="M${x - 28},10H${x + 28}M${x},-18V38" class="wt-stroke-shade" stroke-width="8" stroke-linecap="round"/>`
  const screws = circlePath(-195, -120, 8) + circlePath(195, -120, 8) + circlePath(-195, 120, 8) + circlePath(195, 120, 8)
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-15, 15)})">` +
    `<rect x="-230" y="-150" width="460" height="300" rx="22" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="8"/>` +
    `<rect x="-185" y="-115" width="370" height="185" rx="12" class="wt-fill-c2" opacity="0.85"/>` +
    // linhas da etiqueta (onde se escreveria o nome da fita) e faixa colorida
    `<path d="M-165,-90H165M-165,-62H80" class="wt-stroke-shade" stroke-width="5" stroke-linecap="round" opacity="0.35"/>` +
    `<rect x="-185" y="40" width="370" height="20" class="${rand.pick(COLOR_CLASSES)}" opacity="0.8"/>` +
    `<rect x="-130" y="-35" width="260" height="90" rx="40" class="wt-fill-shade"/>` +
    reel(-75) + reel(75) +
    `<path d="M-150,150L-120,95H120L150,150Z" class="wt-fill-shade" opacity="0.6"/>` +
    `<path d="${screws}" class="wt-fill-shade"/></g>`
  )
}

// Caixa de som: alto-falante grande embaixo, pequeno em cima,
// furinhos de ventilação e botões no topo.
function speaker(rand, [cx, cy]) {
  const woofer = circlePath(0, 70, 110) + circlePath(0, 70, 75)
  let holes = ''
  for (let i = 0; i < 6; i++) holes += circlePath(-100 + i * 40, 200, 6)
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-8, 8)})">` +
    `<rect x="-160" y="-230" width="320" height="460" rx="30" class="wt-fill-shade wt-stroke-c1" stroke-width="6"/>` +
    `<path d="${holes}" class="wt-fill-c1" opacity="0.5"/>` +
    `<path d="${circlePath(-120, -200, 9)}${circlePath(-92, -200, 9)}" class="wt-fill-c2"/>` +
    `<path d="M-110,70H110M0,-40V180" class="wt-stroke-c1" stroke-width="2" opacity="0.25"/>` +
    `<path d="${woofer}" fill="none" class="wt-stroke-c1" stroke-width="10"/>` +
    `<path d="${circlePath(0, 70, 32)}" class="wt-fill-c2"/>` +
    `<path d="${circlePath(0, -130, 50)}" fill="none" class="wt-stroke-c2" stroke-width="8"/>` +
    `<path d="${circlePath(0, -130, 18)}" class="wt-fill-c1"/></g>`
  )
}

// Equalizador: barras subindo do rodapé, com alturas sorteadas,
// e um tracinho de "pico" flutuando acima de cada barra.
function equalizer(rand, intensity, textArea) {
  const start = textArea === 'center' ? 0 : WIDTH * 0.42
  const groups = ['', '', '']
  let peaks = ''
  for (let x = start; x < WIDTH; x += 34) {
    const height = rand.range(40, 160 + intensity * 220)
    const top = HEIGHT - height
    groups[rand.int(0, 2)] += `<rect x="${Math.round(x)}" y="${Math.round(top)}" width="22" height="${Math.round(height + 10)}" rx="11"/>`
    peaks += `M${Math.round(x)},${Math.round(top - rand.range(18, 40))}h22`
  }
  return (
    groups.map((rects, i) => `<g class="${COLOR_CLASSES[i]}" opacity="0.7">${rects}</g>`).join('') +
    `<path d="${peaks}" class="wt-stroke-detail" stroke-width="6" stroke-linecap="round"/>`
  )
}

// Microfone de palco: globo com grade, anel e cabo.
function microphone(rand, [cx, cy]) {
  let grid = ''
  for (let i = -3; i <= 3; i++) grid += `M${i * 26},-215V-45M-90,${-130 + i * 26}H90`
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-25, 25)})">` +
    `<defs><clipPath id="wt-mic-head"><circle cy="-130" r="88"/></clipPath></defs>` +
    `<path d="M0,250C0,330 120,330 140,400" fill="none" class="wt-stroke-shade" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M-40,-30L-28,250H28L40,-30Z" class="wt-fill-shade wt-stroke-c1" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="M-28,120H28" class="wt-stroke-c2" stroke-width="10"/>` +
    `<rect x="-62" y="-50" width="124" height="34" rx="10" class="wt-fill-c1 wt-stroke-shade" stroke-width="5"/>` +
    `<path d="${circlePath(0, -130, 95)}" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="7"/>` +
    `<path d="${grid}" class="wt-stroke-shade" stroke-width="4" opacity="0.45" clip-path="url(#wt-mic-head)"/>` +
    `<path d="M-55,-175Q-40,-205-5,-212" fill="none" class="wt-stroke-c2" stroke-width="12" stroke-linecap="round" opacity="0.6"/>` +
    `</g>`
  )
}

// Palhetas de guitarra espalhadas (triângulo de pontas arredondadas).
function guitarPicks(rand, textArea) {
  let result = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea).map(Math.round)
    result +=
      `<path d="M0,-45C40,-45 50,-25 35,10C25,35 10,50 0,50C-10,50-25,35-35,10C-50,-25-40,-45 0,-45Z" ` +
      `class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="5" transform="translate(${x} ${y}) rotate(${rand.int(0, 359)})"/>`
  }
  return result
}

// Forma de onda: barrinhas espelhadas em volta de uma linha horizontal.
function waveform(rand, intensity) {
  const centerY = HEIGHT * 0.86
  let d = ''
  for (let x = 20; x < WIDTH; x += 16) {
    // a altura segue uma "onda" lenta, mais um pouco de sorteio
    const envelope = 0.4 + 0.6 * Math.abs(Math.sin(x / 260))
    const half = Math.round(rand.range(8, 50 + intensity * 70) * envelope)
    d += `M${x},${Math.round(centerY - half)}V${Math.round(centerY + half)}`
  }
  return `<path d="${d}" class="${rand.pick(STROKE_CLASSES)}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>`
}

// Nota musical: colcheia (uma nota) ou duas notas ligadas por uma barra.
function note(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  const s = round(rand.range(0.6, 1.2))
  const color = rand.pick(COLOR_CLASSES)
  const head = (hx) => `<ellipse cx="${hx}" cy="0" rx="26" ry="19" transform="rotate(-20 ${hx} 0)"/>`
  const shape = rand.chance(0.5)
    ? head(0) + `<rect x="18" y="-120" width="9" height="120"/><path d="M27,-120C40,-95 75,-85 60,-40C65,-75 45,-85 27,-90Z"/>`
    : head(0) + head(90) + `<rect x="18" y="-120" width="9" height="120"/><rect x="108" y="-120" width="9" height="120"/><path d="M18,-120H117V-95H18Z"/>`
  return `<g class="${color}" transform="translate(${x} ${y}) rotate(${rand.int(-20, 20)}) scale(${s})">${shape}</g>`
}

// Fones de ouvido: arco e duas conchas.
function headphones(rand, [cx, cy]) {
  return (
    `<g transform="translate(${Math.round(cx)} ${Math.round(cy)}) rotate(${rand.int(-30, 30)})">` +
    `<path d="M-110,20V-10A110,110 0 0 1 110,-10V20" fill="none" class="wt-stroke-shade" stroke-width="24" stroke-linecap="round"/>` +
    `<rect x="-140" y="0" width="60" height="100" rx="26" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/>` +
    `<rect x="80" y="0" width="60" height="100" rx="26" class="${rand.pick(COLOR_CLASSES)} wt-stroke-shade" stroke-width="6"/></g>`
  )
}

// Pauta musical: cinco linhas onduladas atravessando a tela.
function staff(rand) {
  const baseY = HEIGHT * rand.range(0.15, 0.35)
  const phase = rand.range(0, 6.28)
  let d = ''
  for (let line = 0; line < 5; line++) {
    for (let x = 0; x <= WIDTH; x += 40) {
      const y = baseY + line * 22 + Math.sin(x / 300 + phase) * 60
      d += `${x === 0 ? 'M' : 'L'}${x},${Math.round(y)}`
    }
  }
  return `<path d="${d}" fill="none" class="wt-stroke-c2" stroke-width="3" opacity="0.35"/>`
}
