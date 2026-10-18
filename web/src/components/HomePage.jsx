import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'

// As três linguagens da web, na metáfora do corpo humano usada no dicionário.
const LINGUAGENS = [
  {
    id: 'html',
    nome: 'HTML',
    papel: 'O esqueleto',
    texto: 'Dá a estrutura: diz o que é título, texto, imagem, botão...',
    cor: 'border-lang-html text-lang-html',
  },
  {
    id: 'css',
    nome: 'CSS',
    papel: 'Pele e músculos',
    texto: 'Dá a aparência: cores, fontes, tamanhos, posições, animações.',
    cor: 'border-lang-css text-lang-css',
  },
  {
    id: 'js',
    nome: 'JavaScript',
    papel: 'O cérebro',
    texto: 'Dá o comportamento: pensa, decide e reage às ações.',
    cor: 'border-lang-js text-lang-js',
  },
]

// Símbolos de código que ficam "piscando" no fundo da animação.
// top/left em %, delay em segundos (cada um pisca num tempo diferente).
const SIMBOLOS = [
  { texto: '</>', top: 8, left: 12, delay: 0 },
  { texto: '{ }', top: 18, left: 82, delay: 1.2 },
  { texto: '( ) =>', top: 84, left: 8, delay: 0.6 },
  { texto: ';', top: 88, left: 78, delay: 1.8 },
  { texto: '★', top: 4, left: 58, delay: 2.4 },
  { texto: '✦', top: 62, left: 94, delay: 0.9 },
  { texto: '#', top: 50, left: 2, delay: 2.1 },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8 2xl:px-16">
      <Navbar pagina="inicio" />

      <main className="flex flex-col gap-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div className="flex flex-col gap-6">
            {/* "entrar" faz cada bloco subir aparecendo, um depois do outro */}
            <p
              className="entrar flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wt-lime uppercase"
              style={{ '--atraso': '0s' }}
            >
              <span className="size-2 rounded-full bg-wt-lime" />
              <span className="h-px w-6 bg-wt-lime" />
              Work in Tech · 2026
            </p>

            <h1
              className="entrar font-display text-4xl leading-tight sm:text-5xl xl:text-6xl"
              style={{ '--atraso': '0.15s' }}
            >
              Bem-vindo ao Workshop de <span className="text-wt-lime">Web Fundamentos</span>
            </h1>

            <p className="entrar max-w-xl text-lg text-wt-muted" style={{ '--atraso': '0.3s' }}>
              Em dois dias você vai construir o seu próprio site com <b className="text-lang-html">HTML</b>,{' '}
              <b className="text-lang-css">CSS</b> e <b className="text-lang-js">JavaScript</b> — do esqueleto ao
              cérebro da página.
            </p>

            <div className="entrar flex flex-wrap gap-3" style={{ '--atraso': '0.45s' }}>
              <a
                href="/dicionario.html"
                className="rounded-full bg-wt-lime px-7 py-3 font-display text-wt-ink transition hover:brightness-110"
              >
                Abrir o dicionário
              </a>
              <a
                href="/gerador.html"
                className="rounded-full border-2 border-wt-lime px-7 py-3 font-display text-wt-lime transition hover:bg-wt-lime hover:text-wt-ink"
              >
                Gerar meu background
              </a>
            </div>
          </div>

          <Orbita />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {LINGUAGENS.map((linguagem, i) => (
            <article
              key={linguagem.id}
              className={`entrar rounded-2xl border-t-4 bg-wt-panel p-6 ${linguagem.cor}`}
              style={{ '--atraso': `${0.6 + i * 0.15}s` }}
            >
              <p className="text-xs font-bold tracking-[0.2em] uppercase">{linguagem.nome}</p>
              <h2 className="mt-1 font-display text-xl text-wt-paper">{linguagem.papel}</h2>
              <p className="mt-2 text-wt-muted">{linguagem.texto}</p>
            </article>
          ))}
        </section>

        <p className="entrar text-center font-display text-lg" style={{ '--atraso': '1.1s' }}>
          <span className="text-lang-html">Esqueleto</span> + <span className="text-lang-css">músculos</span> +{' '}
          <span className="text-lang-js">cérebro</span> = <span className="text-wt-lime">uma página viva!</span>
        </p>
      </main>

      <Footer />
    </div>
  )
}

// A animação: os ícones de HTML, CSS e JS girando em órbita ao redor do "</>".
// Toda a mágica está no CSS (classes orbita-* no index.css).
function Orbita() {
  return (
    <div className="orbita-cena mx-auto" aria-hidden="true">
      {SIMBOLOS.map((simbolo) => (
        <span
          key={simbolo.texto}
          className="orbita-simbolo"
          style={{ top: `${simbolo.top}%`, left: `${simbolo.left}%`, animationDelay: `${simbolo.delay}s` }}
        >
          {simbolo.texto}
        </span>
      ))}

      <div className="orbita-anel" />

      <div className="orbita-centro">&lt;/&gt;</div>

      {/* O trilho gira; cada ícone fica num ângulo diferente dele (0°, 120° e 240°) */}
      <div className="orbita-trilho">
        <div className="orbita-item" style={{ '--angulo': '0deg' }}>
          <IconeLinguagem linguagem="html" />
        </div>
        <div className="orbita-item" style={{ '--angulo': '120deg' }}>
          <IconeLinguagem linguagem="css" />
        </div>
        <div className="orbita-item" style={{ '--angulo': '240deg' }}>
          <IconeLinguagem linguagem="js" />
        </div>
      </div>
    </div>
  )
}

// Ícones simplificados das três linguagens, desenhados em SVG.
function IconeLinguagem({ linguagem }) {
  if (linguagem === 'js') {
    return (
      <div className="orbita-icone orbita-icone-js">
        <svg viewBox="0 0 64 64">
          <rect x="10" y="10" width="44" height="44" rx="6" fill="#f7df1e" />
          <text x="48" y="48" textAnchor="end" fontSize="20" fontWeight="900" fill="#1a052e" fontFamily="sans-serif">
            JS
          </text>
        </svg>
      </div>
    )
  }

  // HTML e CSS usam o mesmo "escudo", só mudam a cor e o número.
  const escudo = linguagem === 'html' ? { cor: '#e34f26', numero: '5' } : { cor: '#2965f1', numero: '3' }

  return (
    <div className={`orbita-icone orbita-icone-${linguagem}`}>
      <svg viewBox="0 0 64 64">
        <path d="M12 8h40l-3.6 40L32 56l-16.4-8z" fill={escudo.cor} />
        <path d="M32 12h16l-3 34-13 4z" fill="#fff" opacity="0.15" />
        <text x="32" y="42" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff" fontFamily="sans-serif">
          {escudo.numero}
        </text>
      </svg>
    </div>
  )
}
