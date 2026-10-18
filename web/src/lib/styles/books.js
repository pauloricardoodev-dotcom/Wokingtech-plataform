import { HEIGHT, WIDTH, circlePath, round } from './helpers.js'

const BOOK_COLORS = ['wt-fill-c1', 'wt-fill-c2', 'wt-fill-c3', 'wt-fill-shade']

// Tema "livros": prateleiras com lombadas coloridas (sem títulos).
// Entre os livros aparecem vasos de planta, porta-retratos e pilhas deitadas.
// Cada lombada sorteia um enfeite: faixas, bolinha, listra ou nada.
export function books(rand, { intensity, softness, textArea }) {
  const shelves = 2 + Math.round(intensity * 2)
  const shelfHeight = HEIGHT / shelves
  const corner = round(softness * 8) // mais suavidade = cantos mais arredondados

  let result = ''
  for (let i = 1; i <= shelves; i++) {
    const floorY = i * shelfHeight - 10
    for (const [start, end] of shelfRanges(textArea)) {
      result += shelfRow(rand, start, end, floorY, shelfHeight * 0.82, corner)
      result += `<rect x="${Math.round(start)}" y="${Math.round(floorY)}" width="${Math.round(end - start)}" height="18" rx="4" class="wt-fill-shade"/>`
    }
  }
  return { defs: '', body: result }
}

// Trechos da largura que recebem estantes, deixando livre a área do texto.
function shelfRanges(textArea) {
  if (textArea === 'center') {
    return [
      [-20, WIDTH * 0.34],
      [WIDTH * 0.66, WIDTH + 20],
    ]
  }
  return [[WIDTH * 0.44, WIDTH + 20]]
}

function shelfRow(rand, start, end, floorY, maxHeight, corner) {
  let result = ''
  let x = start + rand.range(0, 30)

  while (x < end - 30) {
    const kind = rand.next()

    if (kind < 0.06) {
      x += rand.range(30, 90) // espaço vazio na prateleira
    } else if (kind < 0.13) {
      const pileWidth = rand.range(110, 170)
      result += bookPile(rand, x, floorY, pileWidth, corner)
      x += pileWidth + 10
    } else if (kind < 0.17) {
      result += plant(rand, x + 50, floorY, maxHeight)
      x += 110
    } else if (kind < 0.2) {
      result += pictureFrame(rand, x, floorY, maxHeight)
      x += maxHeight * 0.5 + 15
    } else {
      // livro em pé (de vez em quando, inclinado)
      const width = rand.range(28, 70)
      const height = rand.range(maxHeight * 0.55, maxHeight)
      const leaning = rand.chance(0.07)
      const shape = book(rand, x, floorY - height, width, height, corner)
      result += leaning
        ? `<g transform="rotate(-12 ${Math.round(x + width)} ${Math.round(floorY)})">${shape}</g>`
        : shape
      x += width + rand.range(2, 5) + (leaning ? 30 : 0)
    }
  }
  return result
}

// Uma lombada: retângulo colorido com um enfeite sorteado.
function book(rand, x, y, width, height, corner) {
  const color = rand.pick(BOOK_COLORS)
  const opacity = rand.range(0.7, 1).toFixed(2)
  const left = Math.round(x)
  const w = Math.round(width)
  let decoration = ''

  const style = rand.pick(['bands', 'bands', 'dot', 'stripe', 'none'])
  if (style === 'bands') {
    decoration =
      `<rect x="${left}" y="${Math.round(y + height * rand.range(0.12, 0.2))}" width="${w}" height="6" class="wt-fill-bg" opacity="0.4"/>` +
      `<rect x="${left}" y="${Math.round(y + height * 0.82)}" width="${w}" height="6" class="wt-fill-bg" opacity="0.4"/>`
  } else if (style === 'dot') {
    decoration = `<path d="${circlePath(x + width / 2, y + height * 0.3, width * 0.22)}" class="wt-fill-bg" opacity="0.45"/>`
  } else if (style === 'stripe') {
    decoration = `<rect x="${Math.round(x + width * 0.4)}" y="${Math.round(y)}" width="${Math.max(3, Math.round(width * 0.2))}" height="${Math.round(height)}" class="wt-fill-bg" opacity="0.3"/>`
  }

  return (
    `<g opacity="${opacity}">` +
    `<rect x="${left}" y="${Math.round(y)}" width="${w}" height="${Math.round(height)}" rx="${corner}" class="${color}"/>` +
    decoration +
    `</g>`
  )
}

// Pilha de livros deitados.
function bookPile(rand, x, floorY, pileWidth, corner) {
  let result = ''
  let y = floorY
  for (let i = rand.int(2, 4); i > 0; i--) {
    const thickness = rand.range(22, 36)
    y -= thickness
    result += book(rand, x + rand.range(-8, 8), y, pileWidth, thickness, corner)
  }
  return result
}

// Vaso com folhas compridas saindo para cima.
function plant(rand, x, floorY, maxHeight) {
  const potHeight = maxHeight * 0.28
  const top = floorY - potHeight
  const pot = `M${Math.round(x - 40)},${Math.round(top)}h80l-12,${Math.round(potHeight)}h-56Z`
  let leaves = ''
  for (let i = rand.int(4, 7); i > 0; i--) {
    const angle = rand.range(-50, 50)
    const length = rand.range(maxHeight * 0.35, maxHeight * 0.6)
    leaves += `<ellipse cx="${Math.round(x)}" cy="${Math.round(top - length / 2)}" rx="${Math.round(length * 0.13)}" ry="${Math.round(length / 2)}" transform="rotate(${Math.round(angle)} ${Math.round(x)} ${Math.round(top)})"/>`
  }
  return `<g class="${rand.pick(['wt-fill-c1', 'wt-fill-c3'])}" opacity="0.9">${leaves}</g>` + `<path d="${pot}" class="wt-fill-c2"/>`
}

// Porta-retrato em pé: moldura com um "desenho" de montanha dentro.
function pictureFrame(rand, x, floorY, maxHeight) {
  const width = maxHeight * 0.5
  const height = maxHeight * 0.62
  const left = Math.round(x)
  const top = Math.round(floorY - height)
  const inner = 12
  const mountain = `M${left + inner},${Math.round(floorY - inner)}l${Math.round(width * 0.35)},${-Math.round(height * 0.45)}l${Math.round(width * 0.2)},${Math.round(height * 0.2)}l${Math.round(width * 0.2)},${-Math.round(height * 0.1)}L${Math.round(left + width - inner)},${Math.round(floorY - inner)}Z`
  return (
    `<rect x="${left}" y="${top}" width="${Math.round(width)}" height="${Math.round(height)}" rx="4" class="wt-fill-shade"/>` +
    `<rect x="${left + inner}" y="${top + inner}" width="${Math.round(width - inner * 2)}" height="${Math.round(height - inner * 2)}" class="wt-fill-c2" opacity="0.5"/>` +
    `<path d="${mountain}" class="${rand.pick(['wt-fill-c1', 'wt-fill-c3'])}"/>`
  )
}
