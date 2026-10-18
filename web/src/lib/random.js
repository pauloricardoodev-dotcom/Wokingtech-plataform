// Gerador de números pseudoaleatórios com semente (algoritmo mulberry32).
// Mesma semente → mesma sequência de números, sempre.
// É isso que torna o gerador determinístico.
export function createRandom(seed) {
  let state = seed >>> 0

  function next() {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296 // número entre 0 e 1
  }

  return {
    next,
    // número decimal entre min e max
    range: (min, max) => min + next() * (max - min),
    // número inteiro entre min e max (inclusive)
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    // um item qualquer da lista
    pick: (list) => list[Math.floor(next() * list.length)],
    // true com a probabilidade pedida (ex: chance(0.3) = 30% das vezes)
    chance: (probability) => next() < probability,
    // Cria um sorteador "filho" gastando um único número deste.
    // Útil para partes que mudam com o tema (dia/noite): o filho pode sortear
    // quanto quiser sem mudar o resto do desenho.
    fork: () => createRandom(Math.floor(next() * 4294967296)),
  }
}

// Sorteia uma semente nova (essa sim usa o Math.random de verdade).
export function newSeed() {
  return Math.floor(Math.random() * 1_000_000)
}
