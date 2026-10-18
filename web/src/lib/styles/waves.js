import { COLOR_CLASSES, HEIGHT, STROKE_CLASSES, WIDTH, circlePath, skyPosition } from './helpers.js'

// Estilo "ondas".
// Variantes sorteadas: camadas cheias subindo do rodapé, só linhas finas,
// ou ondas vindo de cima e de baixo. Às vezes aparece um sol.
export function waves(rand, config) {
  const variant = rand.pick(['filled', 'filled', 'lines', 'mirror'])
  const blur = Math.round(config.softness * 14)

  let body = ''
  if (variant === 'lines') body = lineWaves(rand, config)
  else if (variant === 'mirror') body = filledWaves(rand, config, 'top') + filledWaves(rand, config, 'bottom')
  else body = filledWaves(rand, config, 'bottom')

  let sun = ''
  if (variant !== 'mirror' && rand.chance(0.4)) {
    const [x, y] = skyPosition(rand, config.textArea)
    sun = `<path d="${circlePath(x, y, rand.range(80, 150))}" class="${rand.pick(COLOR_CLASSES)}" opacity="0.85"/>`
  }

  return {
    defs: `<filter id="wt-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${blur}"/></filter>`,
    body: sun + `<g filter="url(#wt-blur)">${body}</g>`,
  }
}

// Camadas cheias. side = "bottom" (sobem do rodapé) ou "top" (descem do topo).
function filledWaves(rand, { intensity, softness }, side) {
  const layers = (side === 'bottom' ? 3 : 2) + Math.round(intensity * (side === 'bottom' ? 5 : 2))
  const roughness = 0.4 * (1 - softness) // mais suavidade = curva mais lisa

  let shapes = ''
  for (let i = 0; i < layers; i++) {
    const depth = layers > 1 ? i / (layers - 1) : 1 // 0 = camada do fundo, 1 = da frente
    const offset = side === 'bottom' ? 380 + depth * 560 : 300 - depth * 220
    const line = wavePoints(rand, offset, rand.range(30, 60 + intensity * 110), roughness)
    const edge = side === 'bottom' ? HEIGHT : 0
    const color = COLOR_CLASSES[i % COLOR_CLASSES.length]
    const opacity = (0.35 + depth * 0.55).toFixed(2)
    shapes += `<path class="${color}" opacity="${opacity}" d="M0,${edge}${line}L${WIDTH},${edge}Z"/>`
  }
  return shapes
}

// Várias linhas finas paralelas, como um tecido ondulado.
function lineWaves(rand, { intensity, softness }) {
  const total = 12 + Math.round(intensity * 20)
  const roughness = 0.4 * (1 - softness)
  const amplitude = rand.range(50, 120)
  const frequency = rand.range(0.6, 1.8)
  const phase = rand.range(0, 6.28)

  let d = ''
  for (let i = 0; i < total; i++) {
    const baseY = 200 + (i / total) * 900
    // todas as linhas usam quase a mesma onda, deslocando um pouco a fase
    d += 'M' + wavePoints(rand, baseY, amplitude, roughness, { frequency, phase: phase + i * 0.12 }).slice(1)
  }
  // só as duas cores mais claras: a terceira some no fundo escuro
  return `<path d="${d}" fill="none" class="${rand.pick(STROKE_CLASSES.slice(0, 2))}" stroke-width="4"/>`
}

// Pontos de uma onda (soma de duas senoides), como comandos "L x,y".
function wavePoints(rand, baseY, amplitude, roughness, fixed = {}) {
  const frequency = fixed.frequency ?? rand.range(0.6, 2.2)
  const phase = fixed.phase ?? rand.range(0, Math.PI * 2)
  let d = ''
  for (let x = 0; x <= WIDTH; x += 40) {
    const t = (x / WIDTH) * Math.PI * 2 * frequency + phase
    const y = baseY + Math.sin(t) * amplitude + Math.sin(t * 2.3 + phase) * amplitude * roughness
    d += `L${x},${Math.round(y)}`
  }
  return d
}
