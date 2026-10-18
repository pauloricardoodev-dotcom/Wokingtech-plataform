import {
  COLOR_CLASSES, GRAIN_FILTER, GRAIN_LAYER, STROKE_CLASSES,
  circlePath, pickPosition, smoothClosedPath,
} from './helpers.js'

// Estilo "blobs": manchas orgânicas.
// Variantes sorteadas: desfocadas ou nítidas com contorno; com ou sem grão,
// anéis e bolinhas flutuando.
export function blobs(rand, { intensity, softness, textArea }) {
  const total = 3 + Math.round(intensity * 6)
  const crisp = rand.chance(0.35) // formas nítidas, com um contorno deslocado
  const blur = crisp ? 0 : Math.round(softness * 130)

  let shapes = ''
  for (let i = 0; i < total; i++) {
    const center = pickPosition(rand, textArea)
    const radius = rand.range(220, 480)
    const colorIndex = rand.int(0, 2)
    const opacity = rand.range(0.55, 0.95).toFixed(2)
    const d = blobPath(rand, center, radius)
    shapes += `<path class="${COLOR_CLASSES[colorIndex]}" opacity="${opacity}" d="${d}"/>`
    if (crisp) {
      shapes += `<path d="${d}" fill="none" class="${STROKE_CLASSES[colorIndex]}" stroke-width="4" transform="translate(${rand.int(-40, 40)} ${rand.int(-40, 40)})"/>`
    }
  }

  const grain = rand.chance(0.5)
  return {
    defs:
      `<filter id="wt-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>` +
      (grain ? GRAIN_FILTER : ''),
    body:
      `<g filter="url(#wt-blur)">${shapes}</g>` +
      floatingExtras(rand, textArea) +
      (grain ? GRAIN_LAYER : ''),
  }
}

// Anéis e bolinhas soltas (a quantidade de cada um também é sorteada).
function floatingExtras(rand, textArea) {
  let rings = ''
  for (let i = rand.int(0, 3); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    rings += circlePath(x, y, rand.range(40, 140))
  }
  let dots = ''
  for (let i = rand.int(0, 8); i > 0; i--) {
    const [x, y] = pickPosition(rand, textArea)
    dots += circlePath(x, y, rand.range(6, 22))
  }
  return (
    `<path d="${rings}" fill="none" class="${rand.pick(STROKE_CLASSES)}" stroke-width="4" opacity="0.7"/>` +
    `<path d="${dots}" class="${rand.pick(COLOR_CLASSES)}" opacity="0.8"/>`
  )
}

// Um círculo "amassado": pontos em volta do centro com raios diferentes.
function blobPath(rand, [cx, cy], radius) {
  const total = rand.int(5, 8)
  const points = []
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2
    const r = radius * rand.range(0.7, 1.15)
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }
  return smoothClosedPath(points)
}
