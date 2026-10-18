import { useState } from 'react'
import { LINGUAGENS, PDF_URL, SECOES } from '../data/dicionario.js'
import Footer from './Footer.jsx'
import Header from './Header.jsx'
import Navbar from './Navbar.jsx'

// Cor de destaque de cada linguagem (as mesmas do PDF).
const CORES = {
  html: { texto: 'text-lang-html', borda: 'border-lang-html', fundo: 'bg-lang-html' },
  css: { texto: 'text-lang-css', borda: 'border-lang-css', fundo: 'bg-lang-css' },
  js: { texto: 'text-lang-js', borda: 'border-lang-js', fundo: 'bg-lang-js' },
}

// Deixa o texto em minúsculas e sem acentos: assim "funcao" acha "função".
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

// Numera os cards de cada seção (#01, #02...) antes de qualquer filtro,
// para o número continuar igual ao do PDF mesmo durante a busca.
function numerarSecoes(secoes) {
  return secoes.map((secao) => {
    let numero = 0
    const grupos = secao.grupos.map((grupo) => ({
      ...grupo,
      itens: grupo.itens.map((item) => {
        numero += 1
        const busca = normalizar(`${item.nome} ${item.tipo} ${item.desc} ${item.exemplo}`)
        return { ...item, numero, busca }
      }),
    }))
    return { ...secao, grupos }
  })
}

const SECOES_NUMERADAS = numerarSecoes(SECOES)

// Mantém só as seções, grupos e cards que combinam com a busca e o filtro.
function filtrar(secoes, termo, linguagem) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean)

  return secoes
    .filter((secao) => linguagem === 'todas' || secao.linguagem === linguagem)
    .map((secao) => ({
      ...secao,
      grupos: secao.grupos
        .map((grupo) => ({
          ...grupo,
          itens: grupo.itens.filter((item) => palavras.every((p) => item.busca.includes(p))),
        }))
        .filter((grupo) => grupo.itens.length > 0),
    }))
    .filter((secao) => secao.grupos.length > 0)
}

function contarItens(secoes) {
  return secoes.reduce(
    (total, secao) => total + secao.grupos.reduce((soma, grupo) => soma + grupo.itens.length, 0),
    0,
  )
}

export default function DictionaryPage() {
  const [termo, setTermo] = useState('')
  const [linguagem, setLinguagem] = useState('todas')

  const resultado = filtrar(SECOES_NUMERADAS, termo, linguagem)
  const total = contarItens(resultado)

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8 2xl:px-16">
      <Navbar pagina="dicionario" />
      <Header
        etiqueta="HTML · CSS · JavaScript"
        titulo="Dicionário dos Web Fundamentos"
        acoes={<PdfButton />}
      />

      <main className="flex flex-col gap-8">
        <SearchBar
          termo={termo}
          onTermoChange={setTermo}
          linguagem={linguagem}
          onLinguagemChange={setLinguagem}
          total={total}
        />

        {resultado.map((secao) => (
          <Section key={secao.id} secao={secao} />
        ))}

        {total === 0 && (
          <p className="rounded-2xl border border-wt-line bg-wt-panel p-8 text-center text-wt-muted">
            Nada encontrado para "{termo}". Tente outra palavra, como <b>flex</b>, <b>evento</b> ou{' '}
            <b>formulário</b>.
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}

// O PDF fica em public/assets: o atributo download faz o navegador baixar em vez de abrir
function PdfButton() {
  return (
    <a
      href={PDF_URL}
      download="Dicionario-dos-Web-Fundamentos.pdf"
      className="rounded-full bg-wt-lime px-6 py-2.5 font-display text-sm text-wt-ink transition hover:brightness-110"
    >
      Baixar em PDF
    </a>
  )
}

function SearchBar({ termo, onTermoChange, linguagem, onLinguagemChange, total }) {
  const opcoes = [{ id: 'todas', nome: 'Tudo' }, ...LINGUAGENS]

  return (
    // sticky: a busca fica "grudada" no topo enquanto a página rola
    <section className="sticky top-0 z-10 -mx-2 flex flex-col gap-4 rounded-2xl border border-wt-line bg-wt-panel/95 p-4 backdrop-blur sm:p-5">
      <label className="relative block">
        <span className="sr-only">Pesquisar no dicionário</span>
        <SearchIcon />
        <input
          type="search"
          value={termo}
          onChange={(e) => onTermoChange(e.target.value)}
          placeholder="Pesquise uma tag, propriedade ou código (ex: flex, <form>, addEventListener)"
          autoFocus
          className="w-full rounded-full border-2 border-wt-line bg-wt-ink py-3 pr-5 pl-12 text-base text-wt-paper placeholder:text-wt-muted focus:border-wt-lime focus:outline-none"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {opcoes.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => onLinguagemChange(opcao.id)}
              className={`rounded-full border px-4 py-1.5 text-sm font-bold transition ${
                linguagem === opcao.id
                  ? 'border-wt-lime bg-wt-lime text-wt-ink'
                  : 'border-wt-line text-wt-paper hover:border-wt-lime'
              }`}
            >
              {opcao.nome}
            </button>
          ))}
        </div>
        <p className="text-sm text-wt-muted">
          {total} {total === 1 ? 'resultado' : 'resultados'}
        </p>
      </div>
    </section>
  )
}

// Ícone de lupa desenhado em SVG (sem precisar de biblioteca de ícones).
function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-wt-lime"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </svg>
  )
}

function Section({ secao }) {
  const cor = CORES[secao.linguagem]
  const nomeLinguagem = LINGUAGENS.find((l) => l.id === secao.linguagem).nome

  return (
    <section className="flex flex-col gap-4">
      <div className={`border-l-4 pl-4 ${cor.borda}`}>
        <p className={`text-xs font-bold tracking-[0.2em] uppercase ${cor.texto}`}>{nomeLinguagem}</p>
        <h2 className="font-display text-2xl">{secao.titulo}</h2>
        <p className="text-sm text-wt-muted">{secao.descricao}</p>
      </div>

      {secao.grupos.map((grupo) => (
        <div key={grupo.titulo || secao.id} className="flex flex-col gap-3">
          {grupo.titulo && <h3 className="font-bold text-wt-paper">{grupo.titulo}</h3>}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grupo.itens.map((item) => (
              <Card key={item.numero} item={item} cor={cor} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}

function Card({ item, cor }) {
  const numero = String(item.numero).padStart(2, '0')

  return (
    <article className={`flex flex-col gap-2 rounded-xl border border-l-4 border-wt-line bg-wt-panel p-4 ${cor.borda}`}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="flex items-baseline gap-2 font-mono text-lg font-bold break-all">
          <span className={`rounded px-1.5 py-0.5 text-xs text-wt-ink ${cor.fundo}`}>#{numero}</span>
          <span className={cor.texto}>{item.nome}</span>
        </h4>
        <span className="shrink-0 rounded-full border border-wt-line px-2 py-0.5 text-[11px] tracking-wide text-wt-muted uppercase">
          {item.tipo}
        </span>
      </div>
      <p className="text-sm text-wt-paper/90">{item.desc}</p>
      <pre className="mt-auto overflow-x-auto rounded-lg bg-wt-ink p-3 text-[13px] leading-relaxed text-wt-paper">
        <code>{item.exemplo}</code>
      </pre>
    </article>
  )
}
