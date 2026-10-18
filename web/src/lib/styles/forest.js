import { HEIGHT, WIDTH, circlePath, cloudPath, pickPosition, ridge, ridgePath, round, skyPosition } from './helpers.js'

// Tema "floresta": camadas de morros com árvores.
// As camadas de trás são mais claras, o que dá sensação de profundidade.
// Variantes sorteadas:
//   árvores → pinheiros, árvores redondas ou misturadas
//   extras  → montanhas ao fundo
// Tema escuro = noite (lua, estrelas, vaga-lumes);
// tema claro = dia (sol com raios, nuvens, pássaros).
export function forest(rand, { intensity, softness, textArea, theme }) {
  // Sorteador próprio para o céu: trocar o tema não mexe nos morros e árvores.
  const celestialRand = rand.fork()
  const treeKind = rand.pick(['pine', 'pine', 'round', 'mixed'])
  const layers = [
    { baseY: 0.52, amplitude: 70, color: 'wt-fill-c3', opacity: 0.35, blur: true },
    { baseY: 0.62, amplitude: 55, color: 'wt-fill-c1', opacity: 0.45, blur: true },
    { baseY: 0.74, amplitude: 45, color: 'wt-fill-shade', opacity: 0.75, blur: false },
    { baseY: 0.86, amplitude: 35, color: 'wt-fill-shade', opacity: 1, blur: false },
  ]

  let hills = ''
  layers.forEach((layer, index) => {
    const depth = index / (layers.length - 1) // 0 = fundo, 1 = frente
    const heightAt = ridge(rand, layer.baseY * HEIGHT, layer.amplitude)
    const trees = treeRow(rand, heightAt, depth, intensity, treeKind)
    const filter = layer.blur ? ' filter="url(#wt-blur)"' : ''
    hills += `<g class="${layer.color}" opacity="${layer.opacity}"${filter}><path d="${ridgePath(heightAt)}${trees}"/></g>`
  })

  const backMountains = rand.chance(0.5) ? mountains(rand) : ''
  const isDay = theme === 'light'

  return {
    defs:
      `<filter id="wt-blur"><feGaussianBlur stdDeviation="${round(softness * 5)}"/></filter>` +
      `<filter id="wt-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
    body:
      (isDay ? daySky(celestialRand, textArea) : nightSky(celestialRand, textArea)) +
      backMountains +
      hills +
      (!isDay && celestialRand.chance(0.5) ? fireflies(celestialRand, textArea) : ''),
  }
}

// Noite: estrelas e lua (às vezes só estrelas).
function nightSky(rand, textArea) {
  const [x, y] = skyPosition(rand, textArea)
  return stars(rand) + (rand.chance(0.8) ? moon(rand, x, y) : '')
}

// Dia: sol com raios, nuvens e pássaros.
function daySky(rand, textArea) {
  const [x, y] = skyPosition(rand, textArea)
  let clouds = ''
  for (let i = rand.int(2, 4); i > 0; i--) {
    clouds += cloudPath(rand.range(0, WIDTH - 300), rand.range(HEIGHT * 0.1, HEIGHT * 0.38), rand.range(160, 300))
  }
  return (
    sunWithRays(rand, x, y) +
    `<path d="${clouds}" class="wt-fill-c2" opacity="0.45"/>` +
    (rand.chance(0.7) ? birds(rand, textArea) : '')
  )
}

// Árvores espalhadas em cima da linha do morro.
function treeRow(rand, heightAt, depth, intensity, treeKind) {
  let d = ''
  let x = rand.range(-20, 40)
  while (x < WIDTH + 40) {
    const height = rand.range(60, 140) * (0.6 + depth * 0.8)
    const kind = treeKind === 'mixed' ? rand.pick(['pine', 'round']) : treeKind
    d += kind === 'pine' ? pine(x, heightAt(x) + 8, height) : roundTree(x, heightAt(x) + 8, height * 0.8)
    x += rand.range(25, 80) / (0.5 + intensity)
  }
  return d
}

// Pinheiro: tronco + três triângulos empilhados.
function pine(x, groundY, height) {
  const width = height * 0.42
  const trunkWidth = width * 0.16
  let d = `M${Math.round(x - trunkWidth / 2)},${Math.round(groundY)}h${Math.round(trunkWidth)}v${-Math.round(height * 0.2)}h${-Math.round(trunkWidth)}Z`
  for (let tier = 0; tier < 3; tier++) {
    const bottom = groundY - height * (0.15 + tier * 0.25)
    const half = (width * (1 - tier * 0.25)) / 2
    const top = bottom - height * 0.42
    d += `M${Math.round(x - half)},${Math.round(bottom)}L${Math.round(x)},${Math.round(top)}L${Math.round(x + half)},${Math.round(bottom)}Z`
  }
  return d
}

// Árvore redonda: tronco + copa feita de dois círculos.
function roundTree(x, groundY, height) {
  const trunkWidth = height * 0.08
  const crown = height * 0.32
  return (
    `M${Math.round(x - trunkWidth / 2)},${Math.round(groundY)}h${Math.round(trunkWidth)}v${-Math.round(height * 0.5)}h${-Math.round(trunkWidth)}Z` +
    circlePath(x, groundY - height * 0.62, crown) +
    circlePath(x + crown * 0.5, groundY - height * 0.5, crown * 0.75)
  )
}

function moon(rand, x, y) {
  const r = rand.range(70, 120)
  return (
    `<path d="${circlePath(x, y, r * 2)}" class="wt-fill-detail" opacity="0.12"/>` +
    `<path d="${circlePath(x, y, r)}" class="wt-fill-detail" opacity="0.95"/>`
  )
}

function sunWithRays(rand, x, y) {
  const r = rand.range(60, 90)
  let rays = ''
  const total = rand.int(10, 16)
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2
    const from = [x + Math.cos(angle) * r * 1.35, y + Math.sin(angle) * r * 1.35]
    const to = [x + Math.cos(angle) * r * 1.9, y + Math.sin(angle) * r * 1.9]
    rays += `M${Math.round(from[0])},${Math.round(from[1])}L${Math.round(to[0])},${Math.round(to[1])}`
  }
  return (
    `<path d="${rays}" class="wt-stroke-c2" stroke-width="8" stroke-linecap="round" opacity="0.8"/>` +
    `<path d="${circlePath(x, y, r)}" class="wt-fill-c2"/>`
  )
}

function stars(rand) {
  let d = ''
  for (let i = rand.int(25, 50); i > 0; i--) {
    d += circlePath(rand.range(0, WIDTH), rand.range(0, HEIGHT * 0.45), rand.range(1.5, 3.5))
  }
  return `<path d="${d}" class="wt-fill-detail" opacity="0.8"/>`
}

// Pássaros: "v" com as asas curvas.
function birds(rand, textArea) {
  let d = ''
  for (let i = rand.int(3, 7); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    const s = rand.range(12, 26)
    const top = Math.min(y, HEIGHT * 0.45) // pássaros ficam só no céu
    d += `M${Math.round(x - s)},${Math.round(top - s * 0.3)}Q${Math.round(x - s * 0.4)},${Math.round(top - s * 0.6)} ${Math.round(x)},${Math.round(top)}Q${Math.round(x + s * 0.4)},${Math.round(top - s * 0.6)} ${Math.round(x + s)},${Math.round(top - s * 0.3)}`
  }
  return `<path d="${d}" fill="none" class="wt-stroke-shade" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`
}

// Cadeia de montanhas pontudas bem ao fundo.
function mountains(rand) {
  let d = `M0,${Math.round(HEIGHT * 0.6)}`
  let x = 0
  while (x < WIDTH) {
    x += rand.range(120, 260)
    const peak = HEIGHT * rand.range(0.28, 0.45)
    d += `L${Math.round(x)},${Math.round(peak)}`
    x += rand.range(120, 260)
    d += `L${Math.round(x)},${Math.round(HEIGHT * rand.range(0.45, 0.55))}`
  }
  d += `L${WIDTH},${HEIGHT}L0,${HEIGHT}Z`
  return `<path d="${d}" class="wt-fill-c3" opacity="0.22"/>`
}

// Vaga-lumes: pontinhos brilhantes na frente das árvores.
function fireflies(rand, textArea) {
  let d = ''
  for (let i = rand.int(12, 25); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    d += circlePath(x, Math.max(y, HEIGHT * 0.55), rand.range(3, 6))
  }
  return `<path d="${d}" class="wt-fill-detail" filter="url(#wt-glow)"/>`
}
