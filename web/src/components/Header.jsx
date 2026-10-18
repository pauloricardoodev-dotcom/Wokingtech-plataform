export default function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <img src="/logo.png" alt="Work in Tech" className="h-14 w-auto self-start sm:h-16" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="sm:text-right">
          <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wt-lime uppercase sm:justify-end">
            <span className="size-2 rounded-full bg-wt-lime" />
            <span className="h-px w-6 bg-wt-lime" />
            Workshop de Frontend
          </p>
          <h1 className="font-display text-2xl leading-tight sm:text-3xl">Gerador de Backgrounds</h1>
        </div>

        <div className="flex flex-wrap gap-3 self-start sm:self-auto">
          {/* Código do workshop: target="_blank" abre em nova aba, rel="noopener" por segurança */}
          <a
            href="https://github.com/PaulinDevendo/Workingtech-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border-2 border-wt-lime px-6 py-2.5 font-display text-sm text-wt-lime transition hover:bg-wt-lime hover:text-wt-ink"
          >
            Ver código no GitHub
          </a>

          {/* O zip fica em public/assets: o atributo download faz o navegador baixar em vez de abrir */}
          <a
            href="/assets/img.zip"
            download="assets-workshop.zip"
            className="rounded-full border-2 border-wt-lime px-6 py-2.5 font-display text-sm text-wt-lime transition hover:bg-wt-lime hover:text-wt-ink"
          >
            Baixar assets
          </a>
        </div>
      </div>
    </header>
  )
}
