import { HEIGHT, WIDTH, circlePath, pickPosition, round, skyPosition, smoothClosedPath, starPath } from './helpers.js'

// Tema "tropical".
// Variantes sorteadas:
//   praia  → sol, mar, areia e coqueiros
//   selva  → folhas grandes de palmeira e costela-de-adão entrando pelas bordas,
//            com flores de hibisco
export function tropical(rand, config) {
  return rand.chance(0.5) ? beach(rand, config) : jungle(rand, config)
}

function beach(rand, { intensity, textArea }) {
  const [sunX, sunY] = skyPosition(rand, textArea)
  const sunRadius = rand.range(90, 140)
  const seaTop = HEIGHT * 0.6
  const sandTop = HEIGHT * 0.8

  // Ondinhas no mar: tracinhos curvos.
  let ripples = ''
  for (let i = 0; i < 30; i++) {
    const x = Math.round(rand.range(0, WIDTH))
    const y = Math.round(rand.range(seaTop + 15, sandTop - 10))
    ripples += `M${x},${y}q20,-10 40,0`
  }

  // Coqueiros do lado oposto ao texto.
  let palms = ''
  for (let i = rand.int(1, 2 + Math.round(intensity)); i > 0; i--) {
    const x = textArea === 'center' ? rand.pick([rand.range(80, 360), rand.range(1560, 1840)]) : rand.range(1150, 1800)
    palms += palmTree(rand, x, sandTop + rand.range(20, 120))
  }

  // A beira da areia é uma curva; a espuma segue a mesma curva um pouco acima.
  const shore = (dy) =>
    `M0,${Math.round(sandTop + dy)}C${WIDTH * 0.3},${Math.round(sandTop - 40 + dy)} ${WIDTH * 0.6},${Math.round(sandTop + 50 + dy)} ${WIDTH},${Math.round(sandTop - 20 + dy)}`

  // pontinhos de textura na areia
  let sandDots = ''
  for (let i = 0; i < 60; i++) {
    sandDots += circlePath(rand.range(0, WIDTH), rand.range(sandTop + 40, HEIGHT), rand.range(2, 4))
  }

  return {
    defs: '',
    body:
      `<path d="${circlePath(sunX, sunY, sunRadius * 1.4)}" class="wt-fill-c2" opacity="0.2"/>` +
      `<path d="${circlePath(sunX, sunY, sunRadius)}" class="wt-fill-c2"/>` +
      (rand.chance(0.6) ? seagulls(rand, textArea) : '') +
      `<rect y="${Math.round(seaTop)}" width="${WIDTH}" height="${Math.round(HEIGHT - seaTop)}" class="wt-fill-c1" opacity="0.6"/>` +
      `<path d="${ripples}" fill="none" class="wt-stroke-bg" stroke-width="4" stroke-linecap="round" opacity="0.6"/>` +
      (rand.chance(0.5) ? sailboat(rand, textArea, seaTop) : '') +
      `<path d="${shore(-14)}" fill="none" class="wt-stroke-bg" stroke-width="10" stroke-linecap="round" stroke-dasharray="60 25" opacity="0.7"/>` +
      `<path d="${shore(0)}V${HEIGHT}H0Z" class="wt-fill-c2" opacity="0.8"/>` +
      `<path d="${sandDots}" class="wt-fill-c3" opacity="0.35"/>` +
      shellsAndStars(rand, textArea, sandTop) +
      palms,
  }
}

// Gaivotas: "m" achatado no céu.
function seagulls(rand, textArea) {
  let d = ''
  for (let i = rand.int(3, 6); i > 0; i--) {
    const x = textArea === 'center' ? rand.pick([rand.range(100, 600), rand.range(1300, 1800)]) : rand.range(900, 1800)
    const y = rand.range(80, 380)
    const s = rand.range(14, 26)
    d += `M${Math.round(x - s)},${Math.round(y)}q${Math.round(s / 2)},${-Math.round(s * 0.7)} ${Math.round(s)},0q${Math.round(s / 2)},${-Math.round(s * 0.7)} ${Math.round(s)},0`
  }
  return `<path d="${d}" fill="none" class="wt-stroke-shade" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
}

// Veleiro no horizonte.
function sailboat(rand, textArea, seaTop) {
  const x = Math.round(textArea === 'center' ? rand.pick([260, 1660]) : rand.range(1000, 1500))
  const y = Math.round(seaTop + 30)
  return (
    `<path d="M${x - 70},${y}H${x + 70}L${x + 50},${y + 26}H${x - 50}Z" class="wt-fill-shade"/>` +
    `<path d="M${x},${y - 4}V${y - 150}" class="wt-stroke-shade" stroke-width="5"/>` +
    `<path d="M${x + 6},${y - 145}L${x + 75},${y - 14}H${x + 6}Z" class="wt-fill-bg"/>` +
    `<path d="M${x - 6},${y - 120}L${x - 55},${y - 14}H${x - 6}Z" class="wt-fill-c3"/>`
  )
}

// Estrelas-do-mar e conchinhas na areia.
function shellsAndStars(rand, textArea, sandTop) {
  let stars = ''
  let shells = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    const x = textArea === 'center' ? rand.pick([rand.range(60, 500), rand.range(1400, 1860)]) : rand.range(900, 1860)
    const y = rand.range(sandTop + 70, HEIGHT - 30)
    if (rand.chance(0.5)) {
      stars += starPath(x, y, rand.range(22, 34), undefined, 5)
    } else {
      // concha: leque com risquinhos
      const s = rand.range(18, 28)
      shells +=
        `<path d="M${Math.round(x - s)},${Math.round(y)}A${Math.round(s)},${Math.round(s)} 0 0 1 ${Math.round(x + s)},${Math.round(y)}L${Math.round(x)},${Math.round(y + s * 0.5)}Z" class="wt-fill-bg wt-stroke-shade" stroke-width="3"/>` +
        `<path d="M${Math.round(x)},${Math.round(y + s * 0.5)}L${Math.round(x - s * 0.5)},${Math.round(y - s * 0.8)}M${Math.round(x)},${Math.round(y + s * 0.5)}V${Math.round(y - s)}M${Math.round(x)},${Math.round(y + s * 0.5)}L${Math.round(x + s * 0.5)},${Math.round(y - s * 0.8)}" class="wt-stroke-shade" stroke-width="2"/>`
    }
  }
  return `<path d="${stars}" class="wt-fill-c1 wt-stroke-shade" stroke-width="3" stroke-linejoin="round"/>` + shells
}

// Coqueiro: tronco curvo em gomos, folhas abertas e cocos.
function palmTree(rand, baseX, baseY) {
  const height = rand.range(420, 620)
  const lean = rand.range(-160, 160)
  const topX = baseX + lean
  const topY = baseY - height

  // tronco: vários gomos ao longo de uma curva
  let trunk = ''
  const segments = 12
  for (let i = 0; i < segments; i++) {
    const t = i / segments
    const x = baseX + lean * t * t
    const y = baseY - height * t
    const width = 34 - t * 12
    trunk += `<ellipse cx="${Math.round(x)}" cy="${Math.round(y)}" rx="${Math.round(width / 2)}" ry="${Math.round(height / segments / 1.5)}"/>`
  }

  let fronds = ''
  const total = rand.int(6, 8)
  for (let i = 0; i < total; i++) {
    const angle = -180 + (i / (total - 1)) * 180 + rand.range(-10, 10)
    fronds += frond(rand, topX, topY, angle, rand.range(200, 290))
  }
  const coconuts = circlePath(topX - 14, topY + 14, 15) + circlePath(topX + 14, topY + 16, 15) + circlePath(topX, topY + 30, 15)

  return `<g class="wt-fill-shade">${trunk}</g>${fronds}<path d="${coconuts}" class="wt-fill-c3"/>`
}

// Folha de palmeira: um talo curvo com folhinhas compridas dos dois lados.
function frond(rand, x, y, angle, length) {
  const color = rand.pick(['wt-fill-c3', 'wt-fill-shade'])
  let leaflets = ''
  const total = 9 // folhinhas de cada lado (mais que isso deixa o SVG pesado)
  for (let i = 1; i <= total; i++) {
    const t = i / total
    const px = Math.round(t * length)
    const py = Math.round(t * t * length * 0.35) // o talo "cai" com o peso
    const size = Math.round((1 - t * 0.6) * length * 0.34)
    for (const side of [-1, 1]) {
      leaflets += `<ellipse cx="${px}" cy="${py + side * Math.round(size / 2)}" rx="11" ry="${Math.round(size / 2)}" transform="rotate(${side * -35} ${px} ${py})"/>`
    }
  }
  return (
    `<g transform="translate(${Math.round(x)} ${Math.round(y)}) rotate(${Math.round(angle)})" class="${color}">` +
    `<path d="M0,0Q${Math.round(length * 0.5)},${Math.round(length * 0.05)} ${Math.round(length)},${Math.round(length * 0.35)}" fill="none" class="wt-stroke-shade" stroke-width="7"/>` +
    leaflets +
    `</g>`
  )
}

function jungle(rand, { intensity, softness, textArea }) {
  // Pontos de onde as folhas entram (bordas e cantos longe do texto).
  const anchors =
    textArea === 'center'
      ? [[0, 0], [0, HEIGHT], [WIDTH, 0], [WIDTH, HEIGHT], [0, HEIGHT / 2], [WIDTH, HEIGHT / 2]]
      : [[WIDTH, 0], [WIDTH, HEIGHT], [WIDTH, HEIGHT / 2], [WIDTH * 0.7, 0], [WIDTH * 0.7, HEIGHT]]

  let leaves = ''
  const total = 5 + Math.round(intensity * 6)
  for (let i = 0; i < total; i++) {
    const [ax, ay] = rand.pick(anchors)
    // aponta a folha para o meio da tela, com um pouco de variação
    const angle = (Math.atan2(HEIGHT / 2 - ay, WIDTH / 2 - ax) * 180) / Math.PI + rand.range(-40, 40)
    leaves += rand.chance(0.5)
      ? frond(rand, ax, ay, angle, rand.range(380, 560))
      : monstera(rand, ax, ay, angle, rand.range(260, 380))
  }

  let flowers = ''
  for (let i = rand.int(1, 4); i > 0; i--) {
    const [ax, ay] = rand.pick(anchors)
    flowers += hibiscus(rand, ax + rand.range(-260, 260), ay + rand.range(-200, 200))
  }

  let butterflies = ''
  for (let i = rand.int(0, 3); i > 0; i--) {
    butterflies += butterfly(rand, pickPosition(rand, textArea))
  }

  return {
    defs: `<filter id="wt-blur"><feGaussianBlur stdDeviation="${round(softness * 3)}"/></filter>`,
    body: `<g filter="url(#wt-blur)">${leaves}${flowers}</g>${butterflies}`,
  }
}

// Borboleta pequena: quatro asas e um corpinho.
function butterfly(rand, [cx, cy]) {
  const x = Math.round(cx)
  const y = Math.round(cy)
  return (
    `<g transform="translate(${x} ${y}) rotate(${rand.int(-30, 30)})" class="${rand.pick(['wt-fill-c1', 'wt-fill-c2'])} wt-stroke-shade" stroke-width="3">` +
    `<ellipse cx="-20" cy="-12" rx="22" ry="16" transform="rotate(-30 -20 -12)"/><ellipse cx="20" cy="-12" rx="22" ry="16" transform="rotate(30 20 -12)"/>` +
    `<ellipse cx="-14" cy="14" rx="13" ry="10" transform="rotate(30 -14 14)"/><ellipse cx="14" cy="14" rx="13" ry="10" transform="rotate(-30 14 14)"/>` +
    `<rect x="-3" y="-22" width="6" height="44" rx="3" class="wt-fill-shade"/></g>`
  )
}

// Costela-de-adão: folha larga com cortes saindo do talo central.
function monstera(rand, x, y, angle, length) {
  const points = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    points.push([length * 0.55 + Math.cos(a) * length * 0.5, Math.sin(a) * length * 0.42])
  }
  let cuts = ''
  for (let i = 1; i <= 4; i++) {
    const px = Math.round(length * (0.15 + i * 0.18))
    cuts += `M${px},0L${px + 50},-${Math.round(length * 0.42)}M${px},0L${px + 50},${Math.round(length * 0.42)}`
  }
  // nervuras finas entre os cortes
  let veins = ''
  for (let i = 1; i <= 4; i++) {
    const px = Math.round(length * (0.24 + i * 0.18))
    veins += `M${px - 40},0L${px},-${Math.round(length * 0.3)}M${px - 40},0L${px},${Math.round(length * 0.3)}`
  }
  return (
    `<g transform="translate(${Math.round(x)} ${Math.round(y)}) rotate(${Math.round(angle)})">` +
    `<path d="${smoothClosedPath(points)}" class="${rand.pick(['wt-fill-c3', 'wt-fill-c1'])}"/>` +
    `<path d="${veins}" class="wt-stroke-shade" stroke-width="3" opacity="0.35"/>` +
    `<path d="${cuts}" class="wt-stroke-bg" stroke-width="14" stroke-linecap="round"/>` +
    `<path d="M0,0H${Math.round(length * 1.05)}" class="wt-stroke-shade" stroke-width="8" opacity="0.6"/></g>`
  )
}

// Hibisco: cinco pétalas redondas e um miolo com pistilo.
function hibiscus(rand, x, y) {
  const r = rand.range(30, 50)
  let petals = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    petals += circlePath(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.85)
  }
  return (
    `<path d="${petals}" class="wt-fill-c2"/>` +
    `<path d="${circlePath(x, y, r * 0.4)}" class="wt-fill-c1"/>` +
    `<path d="M${Math.round(x)},${Math.round(y)}l${Math.round(r * 0.9)},${-Math.round(r * 0.9)}" class="wt-stroke-shade" stroke-width="5" stroke-linecap="round"/>`
  )
}
