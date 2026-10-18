// Título de cada página, logo abaixo da navbar.
// `acoes` (opcional) são botões extras mostrados à direita, como o "Baixar em PDF".
export default function Header({ etiqueta, titulo, acoes }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wt-lime uppercase">
          <span className="size-2 rounded-full bg-wt-lime" />
          <span className="h-px w-6 bg-wt-lime" />
          {etiqueta}
        </p>
        <h1 className="font-display text-2xl leading-tight sm:text-3xl">{titulo}</h1>
      </div>

      {acoes}
    </header>
  )
}
