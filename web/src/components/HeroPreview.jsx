// Mostra o background dentro de um hero de exemplo (título + botão).
export default function HeroPreview({ svg, palette, textArea, theme, onThemeChange }) {
  const alignment = textArea === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-[0.2em] text-wt-muted uppercase">Preview</h2>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>

      {/* 16:9, mas sem passar da altura da tela em monitores muito largos */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-wt-line sm:aspect-video lg:max-h-[calc(100vh-15rem)]">
        {/* O SVG gerado vira o fundo do hero */}
        <div className="hero-art absolute inset-0" dangerouslySetInnerHTML={{ __html: svg }} />

        <div
          className={`relative flex h-full flex-col justify-center gap-4 p-6 sm:p-10 ${alignment}`}
          style={{ color: palette.text }}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-80">Meu projeto</p>
          <h3 className="max-w-md font-display text-3xl leading-tight sm:text-5xl">
            Um site com a minha cara
          </h3>
          <p className="max-w-sm text-base opacity-90 sm:text-lg">
            Este é só um texto de exemplo para ver se o fundo combina.
          </p>
          <button
            type="button"
            className="rounded-full px-6 py-3 font-bold"
            style={{ backgroundColor: palette.text, color: palette.bg }}
          >
            Começar agora
          </button>
        </div>
      </div>
    </section>
  )
}

function ThemeToggle({ theme, onChange }) {
  const options = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
  ]

  return (
    <div className="flex rounded-full border border-wt-line bg-wt-panel p-1">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
            theme === option.id ? 'bg-wt-lime text-wt-ink' : 'text-wt-muted hover:text-wt-paper'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
