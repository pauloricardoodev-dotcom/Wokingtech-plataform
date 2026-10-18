// Barra de navegação compartilhada pelas duas páginas do site.
// `pagina` diz qual link fica marcado como ativo: "inicio", "dicionario" ou "gerador".

const PAGINAS = [
  { id: 'inicio', nome: 'Início', href: '/' },
  { id: 'dicionario', nome: 'Dicionário de códigos', href: '/dicionario.html' },
  // soDesktop: o link some em telas pequenas (o gerador é feito para computador)
  { id: 'gerador', nome: 'Gerador de Backgrounds', href: '/gerador.html', soDesktop: true },
]

// Mesmo PDF do botão "Baixar em PDF" da página do dicionário
const PDF_URL = '/assets/Dicionario-dos-Web-Fundamentos.pdf'

const GITHUB_URL = 'https://github.com/PaulinDevendo/Workingtech-2026'

export default function Navbar({ pagina }) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-wt-line bg-wt-panel px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
        <a href="/" className="shrink-0">
          <img src="/logo.png" alt="Work in Tech — início" className="h-10 w-auto sm:h-12" />
        </a>

        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {PAGINAS.map((item) => {
            const ativa = item.id === pagina
            return (
              <li key={item.id} className={item.soDesktop ? 'hidden lg:block' : undefined}>
                <a
                  href={item.href}
                  // aria-current avisa aos leitores de tela qual é a página atual
                  aria-current={ativa ? 'page' : undefined}
                  // Link de navegação: a página atual fica verde e sublinhada
                  className={`block py-2 text-sm font-bold decoration-2 underline-offset-8 transition hover:text-wt-lime ${
                    ativa ? 'text-wt-lime underline' : 'text-wt-paper'
                  }`}
                >
                  {item.nome}
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* O zip fica em public/assets: o atributo download faz o navegador baixar em vez de abrir */}
        {/* Os assets são para o gerador (só no computador): no celular, o botão vira o download do dicionário */}
        <a href="/assets/img.zip" download="assets-workshop.zip" className={`hidden lg:flex ${BOTAO}`}>
          <DownloadIcon />
          Baixar assets
        </a>
        <a href={PDF_URL} download="Dicionario-dos-Web-Fundamentos.pdf" className={`flex lg:hidden ${BOTAO}`}>
          <DownloadIcon />
          Dicionário
        </a>

        {/* Código do workshop: target="_blank" abre em nova aba, rel="noopener" por segurança */}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={`flex ${BOTAO}`}>
          <GithubIcon />
          GitHub
        </a>
      </div>
    </nav>
  )
}

// Sem "flex" aqui: cada botão escolhe se aparece (flex) ou some (hidden) em cada tamanho de tela
const BOTAO =
  'items-center gap-2 rounded-full border-2 border-wt-lime px-4 py-2 font-display text-sm text-wt-lime transition hover:bg-wt-lime hover:text-wt-ink'

// Ícones em SVG direto no código (sem biblioteca de ícones).
// currentColor faz o ícone usar a mesma cor do texto do botão.
function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}
