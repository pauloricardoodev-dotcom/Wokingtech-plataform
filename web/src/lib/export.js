import { generate } from './generate.js'
import { makePalette } from './palette.js'

// Tamanho do PNG baixado.
export const PNG_WIDTH = 1920
export const PNG_HEIGHT = 1080

// SVG pronto para virar imagem: troca as variáveis CSS pelas cores de verdade,
// porque fora da página as variáveis não existem.
export function exportableSvg(config, theme) {
  const palette = makePalette(config.hue, config.secondaryHue, theme)
  // Ex: "var(--c1)" vira "hsl(265, 85%, 55%)"
  return generate(config, theme).replace(/var\(--(\w+)\)/g, (_, name) => palette[name])
}

// Desenha o SVG num <canvas> de 1920×1080 e salva como PNG.
export async function downloadPng(config, theme) {
  const svg = exportableSvg(config, theme).replace('<svg ', `<svg width="${PNG_WIDTH}" height="${PNG_HEIGHT}" `)
  const image = await loadImage(svg)

  const canvas = document.createElement('canvas')
  canvas.width = PNG_WIDTH
  canvas.height = PNG_HEIGHT
  canvas.getContext('2d').drawImage(image, 0, 0, PNG_WIDTH, PNG_HEIGHT)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  downloadBlob(blob, `background-${config.style}-${config.seed}-${theme}.png`)
}

function loadImage(svg) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = reject
    image.src = url
  })
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
