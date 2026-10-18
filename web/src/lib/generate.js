import { SVG_COLORS, makePalette } from './palette.js'
import { createRandom } from './random.js'
import { HEIGHT, WIDTH } from './styles/helpers.js'
import { aurora } from './styles/aurora.js'
import { bauhaus } from './styles/bauhaus.js'
import { blobs } from './styles/blobs.js'
import { books } from './styles/books.js'
import { city } from './styles/city.js'
import { code } from './styles/code.js'
import { coffee } from './styles/coffee.js'
import { forest } from './styles/forest.js'
import { gamer } from './styles/gamer.js'
import { graffiti } from './styles/graffiti.js'
import { hardware } from './styles/hardware.js'
import { memphis } from './styles/memphis.js'
import { music } from './styles/music.js'
import { neon } from './styles/neon.js'
import { nerd } from './styles/nerd.js'
import { oriental } from './styles/oriental.js'
import { space } from './styles/space.js'
import { tropical } from './styles/tropical.js'
import { waves } from './styles/waves.js'
import { y2k } from './styles/y2k.js'

// Todos os estilos disponíveis. Para criar um novo, basta
// escrever a função em styles/ e adicionar aqui e na lista abaixo.
const STYLES = {
  blobs, waves, memphis, bauhaus, aurora,
  code, hardware, neon, y2k,
  city, forest, oriental, space, tropical,
  gamer, nerd, music, books, graffiti, coffee,
}

export const STYLE_GROUPS = [
  {
    label: 'Abstratos',
    options: [
      { id: 'blobs', label: 'Blobs' },
      { id: 'waves', label: 'Ondas' },
      { id: 'memphis', label: 'Memphis' },
      { id: 'bauhaus', label: 'Bauhaus' },
      { id: 'aurora', label: 'Aurora' },
    ],
  },
  {
    label: 'Tech',
    options: [
      { id: 'code', label: 'Códigos' },
      { id: 'hardware', label: 'Hardware' },
      { id: 'neon', label: 'Neon' },
      { id: 'y2k', label: 'Y2K' },
    ],
  },
  {
    label: 'Paisagens',
    options: [
      { id: 'city', label: 'Cidade cyberpunk' },
      { id: 'forest', label: 'Floresta' },
      { id: 'oriental', label: 'Oriental' },
      { id: 'space', label: 'Espaço' },
      { id: 'tropical', label: 'Tropical' },
    ],
  },
  {
    label: 'Cultura',
    options: [
      { id: 'gamer', label: 'Gamer' },
      { id: 'nerd', label: 'Nerd' },
      { id: 'music', label: 'Música' },
      { id: 'books', label: 'Livros' },
      { id: 'graffiti', label: 'Graffiti' },
      { id: 'coffee', label: 'Café' },
    ],
  },
]

export const DEFAULT_CONFIG = {
  hue: 265, // cor principal
  secondaryHue: 320, // cor secundária
  style: 'blobs',
  seed: 123456,
  intensity: 0.5,
  softness: 0.6,
  textArea: 'left',
}

// Função pura: mesma config + mesmo tema → mesmo SVG, sempre.
export function generate(config, theme = 'dark') {
  const rand = createRandom(config.seed)
  const drawStyle = STYLES[config.style] ?? STYLES.blobs
  // O tema também vai para o estilo: alguns desenham dia (light) ou noite (dark).
  const { defs, body } = drawStyle(rand, { ...config, theme })

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid slice" style="${paletteVariables(config, theme)}">`,
    `<style>${colorClasses()}</style>`,
    `<defs>${defs}${calmGradient(config.textArea)}</defs>`,
    `<rect class="wt-fill-bg" width="${WIDTH}" height="${HEIGHT}"/>`,
    body,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="url(#wt-calm)"/>`,
    `</svg>`,
  ].join('')
}

// As cores entram como variáveis CSS: trocar o tema só troca esta linha.
function paletteVariables(config, theme) {
  const palette = makePalette(config.hue, config.secondaryHue, theme)
  return SVG_COLORS.map((name) => `--${name}:${palette[name]}`).join(';')
}

// Para cada cor, três classes: preenchimento, contorno e parada de degradê.
// Ex: .wt-fill-c1{fill:var(--c1)}
function colorClasses() {
  return SVG_COLORS.map(
    (name) =>
      `.wt-fill-${name}{fill:var(--${name})}` +
      `.wt-stroke-${name}{stroke:var(--${name})}` +
      `.wt-stop-${name}{stop-color:var(--${name})}`,
  ).join('')
}

// "Máscara" que acalma a área do texto, cobrindo-a com a cor de fundo.
function calmGradient(textArea) {
  if (textArea === 'center') {
    return (
      `<radialGradient id="wt-calm">` +
      `<stop offset="0" class="wt-stop-bg" stop-opacity="0.9"/>` +
      `<stop offset="0.55" class="wt-stop-bg" stop-opacity="0.6"/>` +
      `<stop offset="1" class="wt-stop-bg" stop-opacity="0"/>` +
      `</radialGradient>`
    )
  }

  return (
    `<linearGradient id="wt-calm">` +
    `<stop offset="0" class="wt-stop-bg" stop-opacity="0.92"/>` +
    `<stop offset="0.35" class="wt-stop-bg" stop-opacity="0.7"/>` +
    `<stop offset="0.65" class="wt-stop-bg" stop-opacity="0"/>` +
    `</linearGradient>`
  )
}
