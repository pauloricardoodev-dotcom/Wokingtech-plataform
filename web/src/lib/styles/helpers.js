// Funções pequenas usadas por mais de um estilo.

export const WIDTH = 1920
export const HEIGHT = 1080

// Classes CSS das cores dentro do SVG (definidas em generate.js):
// wt-fill-* pinta o preenchimento, wt-stroke-* pinta o contorno.
export const COLOR_CLASSES = ['wt-fill-c1', 'wt-fill-c2', 'wt-fill-c3']
export const STROKE_CLASSES = ['wt-stroke-c1', 'wt-stroke-c2', 'wt-stroke-c3']

// Arredonda um ponto [x, y] para texto "x,y" (deixa o SVG mais leve).
export function point([x, y]) {
  return `${Math.round(x)},${Math.round(y)}`
}

// Arredonda um número para no máximo 1 casa decimal.
export function round(value) {
  return Math.round(value * 10) / 10
}

// Liga os pontos com curvas suaves, fechando o desenho
// (técnica Catmull-Rom convertida em curvas Bézier).
export function smoothClosedPath(points) {
  const n = points.length
  let d = `M${point(points[0])}`
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    const control1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const control2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${point(control1)} ${point(control2)} ${point(p2)}`
  }
  return d + 'Z'
}

// Círculo escrito como path (dá para juntar vários num único <path>).
export function circlePath(x, y, r) {
  const left = Math.round(x - r)
  const cy = Math.round(y)
  const radius = Math.round(r)
  return `M${left},${cy}a${radius},${radius} 0 1 0 ${radius * 2},0a${radius},${radius} 0 1 0 ${-radius * 2},0`
}

// Nuvem fofinha: uma base arredondada com três "bolas" em cima.
// x, y = canto de baixo à esquerda; width = largura total.
export function cloudPath(x, y, width) {
  const h = width * 0.28
  return (
    `M${Math.round(x + h / 2)},${Math.round(y)}h${Math.round(width - h)}` +
    `a${Math.round(h / 2)},${Math.round(h / 2)} 0 0 0 0,${-Math.round(h)}h${-Math.round(width - h)}` +
    `a${Math.round(h / 2)},${Math.round(h / 2)} 0 0 0 0,${Math.round(h)}Z` +
    circlePath(x + width * 0.32, y - h * 0.9, width * 0.2) +
    circlePath(x + width * 0.58, y - h * 1.05, width * 0.25) +
    circlePath(x + width * 0.78, y - h * 0.75, width * 0.15)
  )
}

// Estrela de N pontas (alterna raio de fora e raio de dentro).
export function starPath(x, y, outer, inner = outer * 0.45, tips = 5) {
  const points = []
  for (let i = 0; i < tips * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (i / (tips * 2)) * Math.PI * 2 - Math.PI / 2
    points.push([x + Math.cos(angle) * radius, y + Math.sin(angle) * radius])
  }
  return 'M' + points.map(point).join('L') + 'Z'
}

// Coração com centro em x,y.
export function heartPath(x, y, size) {
  const s = size / 100
  const p = (dx, dy) => `${Math.round(x + dx * s)},${Math.round(y + dy * s)}`
  return `M${p(0, 35)}C${p(-90, -25)} ${p(-45, -95)} ${p(0, -45)}C${p(45, -95)} ${p(90, -25)} ${p(0, 35)}Z`
}

// Textura de "grão" (ruído), usada em cima do desenho com pouca opacidade.
export const GRAIN_FILTER =
  `<filter id="wt-grain" x="0" y="0" width="100%" height="100%">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>` +
  `<feColorMatrix type="saturate" values="0"/></filter>`
export const GRAIN_LAYER = `<rect width="100%" height="100%" filter="url(#wt-grain)" opacity="0.12"/>`

// Sorteia uma posição para uma forma, evitando a área do texto.
export function pickPosition(rand, textArea) {
  if (textArea === 'center') {
    // Em volta do centro, nunca em cima dele.
    const angle = rand.range(0, Math.PI * 2)
    const distance = rand.range(0.55, 1.1)
    return [
      WIDTH / 2 + Math.cos(angle) * distance * WIDTH * 0.55,
      HEIGHT / 2 + Math.sin(angle) * distance * HEIGHT * 0.6,
    ]
  }

  // textArea "left": formas concentradas do meio para a direita.
  return [rand.range(WIDTH * 0.45, WIDTH * 1.05), rand.range(-100, HEIGHT + 100)]
}

// Posição do "elemento principal" da cena (ex: o disco de vinil, o átomo),
// sempre longe do texto.
export function focusPosition(rand, textArea) {
  const x = textArea === 'center' ? rand.pick([0.17, 0.83]) : rand.range(0.68, 0.78)
  return [x * WIDTH, rand.range(0.42, 0.58) * HEIGHT]
}

// Desenha "pixel art" a partir de linhas de texto: "X" = pixel pintado.
// Devolve um path com um quadradinho para cada pixel.
export function pixelArt(rows, x, y, size) {
  let d = ''
  rows.forEach((row, rowIndex) => {
    for (let col = 0; col < row.length; col++) {
      if (row[col] !== 'X') continue
      d += `M${Math.round(x + col * size)},${Math.round(y + rowIndex * size)}h${size}v${size}h${-size}Z`
    }
  })
  return d
}

// Posição no céu para um sol/lua, longe do texto.
export function skyPosition(rand, textArea) {
  const x = textArea === 'center' ? rand.pick([0.14, 0.86]) : rand.range(0.62, 0.85)
  return [x * WIDTH, rand.range(0.18, 0.32) * HEIGHT]
}

// Linha de horizonte ondulada (usada em morros e montanhas).
// Devolve uma função: dado um x, diz a altura (y) do morro naquele ponto.
export function ridge(rand, baseY, amplitude) {
  const waves = [
    { frequency: rand.range(0.5, 1.2), phase: rand.range(0, 6.28), size: 1 },
    { frequency: rand.range(1.8, 3.5), phase: rand.range(0, 6.28), size: 0.35 },
  ]
  return (x) => {
    let y = baseY
    for (const wave of waves) {
      y += Math.sin((x / WIDTH) * Math.PI * 2 * wave.frequency + wave.phase) * amplitude * wave.size
    }
    return y
  }
}

// Fecha um morro: segue a linha do horizonte e desce até o rodapé.
export function ridgePath(heightAt, step = 40) {
  let d = `M0,${HEIGHT}`
  for (let x = 0; x <= WIDTH; x += step) {
    d += `L${x},${Math.round(heightAt(x))}`
  }
  return d + `L${WIDTH},${HEIGHT}Z`
}
