// Transforma as duas cores escolhidas (hue, de 0 a 360) em uma paleta.
// Dark e light saem das mesmas cores; só muda a luminosidade.

function hsl(hue, saturation, lightness) {
  const h = ((hue % 360) + 360) % 360
  return `hsl(${Math.round(h)}, ${saturation}%, ${lightness}%)`
}

// Cor "no meio do caminho" entre duas cores, pelo lado mais curto do círculo.
// Ex: azul (220) e rosa (330) → roxo (275).
export function middleHue(a, b) {
  const difference = ((b - a + 540) % 360) - 180 // entre -180 e 180
  return a + difference / 2
}

// bg = fundo · c1 = cor principal · c2 = cor secundária · c3 = mistura das duas
// shade = silhuetas (prédios, morros, painéis)
// detail = destaque para detalhes pequenos (estrelas, brilhos): sempre contrasta com o fundo
// text = texto do hero
export function makePalette(hue, secondaryHue, theme) {
  const mixHue = middleHue(hue, secondaryHue)

  if (theme === 'light') {
    // Formas em tons médios e saturados: no fundo claro, tons pastel somem.
    return {
      bg: hsl(hue, 60, 96),
      c1: hsl(hue, 80, 58),
      c2: hsl(secondaryHue, 85, 66),
      c3: hsl(mixHue, 70, 48),
      shade: hsl(hue, 40, 26),
      detail: hsl(secondaryHue, 75, 38), // escuro, para aparecer no fundo claro
      text: hsl(hue, 45, 12),
    }
  }

  return {
    bg: hsl(hue, 50, 7),
    c1: hsl(hue, 85, 55),
    c2: hsl(secondaryHue, 90, 62),
    c3: hsl(mixHue, 75, 42),
    shade: hsl(hue, 45, 16),
    detail: hsl(secondaryHue, 90, 85), // bem claro, para brilhar no fundo escuro
    text: hsl(hue, 30, 97),
  }
}

// Nomes das cores que viram variáveis CSS dentro do SVG.
export const SVG_COLORS = ['bg', 'c1', 'c2', 'c3', 'shade', 'detail']
