import { HEIGHT, STROKE_CLASSES, WIDTH, heartPath, pickPosition, round, starPath } from './helpers.js'

// Tema "neon": formas de tubo de neon brilhando.
// O brilho é um filtro: uma cópia desfocada da forma fica por baixo dela.
// Variantes sorteadas: parede de tijolos ao fundo, moldura neon na borda,
// reflexo no chão.
export function neon(rand, { intensity, softness, textArea }) {
  const total = 4 + Math.round(intensity * 6)

  let shapes = ''
  for (let i = 0; i < total; i++) {
    const [x, y] = pickPosition(rand, textArea).map(Math.round)
    const size = rand.range(0.6, 1.5)
    const angle = rand.int(-25, 25)
    const draw = rand.pick(SHAPES)
    const dashed = rand.chance(0.15) ? ' stroke-dasharray="2 26"' : '' // tracejado = "lâmpadas"
    shapes += `<path d="${draw(rand)}" class="${rand.pick(STROKE_CLASSES)}"${dashed} transform="translate(${x} ${y}) rotate(${angle}) scale(${round(size)})"/>`
  }

  const glow = round(6 + softness * 18)
  const wall = rand.chance(0.4)
  const reflection = rand.chance(0.35)
  const frame = rand.chance(0.25)
    ? `<rect x="50" y="50" width="${WIDTH - 100}" height="${HEIGHT - 100}" rx="40" class="${rand.pick(STROKE_CLASSES)}"/>`
    : ''
  const lights = `<g filter="url(#wt-glow)" fill="none" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">${shapes}${frame}</g>`

  return {
    defs:
      `<filter id="wt-glow" x="-50%" y="-50%" width="200%" height="200%">` +
      `<feGaussianBlur stdDeviation="${glow}" result="glow"/>` +
      `<feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
      (wall
        ? `<pattern id="wt-bricks" width="160" height="80" patternUnits="userSpaceOnUse">` +
          `<path d="M0,1H160M0,41H160M1,0V40M81,40V80" class="wt-stroke-shade" stroke-width="3" fill="none"/></pattern>`
        : ''),
    body:
      (wall ? `<rect width="100%" height="100%" fill="url(#wt-bricks)" opacity="0.6"/>` : '') +
      lights +
      // reflexo: as mesmas luzes de cabeça para baixo, bem apagadas, na parte de baixo
      (reflection ? `<g transform="translate(0 ${HEIGHT * 1.75}) scale(1 -1)" opacity="0.15">${lights}</g>` : ''),
  }
}

// Cada forma é desenhada em volta do ponto 0,0.
const SHAPES = [
  // anel
  () => 'M-110,0A110,110 0 1 0 110,0A110,110 0 1 0-110,0',
  // dois anéis
  () => 'M-110,0A110,110 0 1 0 110,0A110,110 0 1 0-110,0M-75,0A75,75 0 1 0 75,0A75,75 0 1 0-75,0',
  // triângulo
  () => 'M0,-120L104,60L-104,60Z',
  // quadrado
  () => 'M-90,-90H90V90H-90Z',
  // zigue-zague
  (rand) => {
    let d = 'M-160,0'
    const steps = rand.int(4, 7)
    for (let i = 1; i <= steps; i++) d += `L${Math.round(-160 + (320 / steps) * i)},${i % 2 ? -45 : 45}`
    return d
  },
  // sinal de mais
  () => 'M-70,0H70M0,-70V70',
  // arco
  () => 'M-130,40A140,140 0 0 1 130,40',
  // raio
  () => 'M30,-130L-50,10H10L-30,130L60,-20H0Z',
  // coração
  () => heartPath(0, 0, 130),
  // estrela
  () => starPath(0, 0, 110),
  // onda
  () => 'M-180,0C-135,-60-90,-60-45,0S45,60 90,0S135,-60 180,0',
]
