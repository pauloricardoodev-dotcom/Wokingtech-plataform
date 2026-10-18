// Aviso mostrado só em telas pequenas: o gerador de backgrounds é feito para computador.
export default function AvisoComputador() {
  return (
    <p className="flex items-center gap-3 rounded-2xl border border-wt-line bg-wt-panel p-4 text-sm text-wt-paper lg:hidden">
      <InfoIcon />
      As imagens de background só podem ser geradas pelo computador.
    </p>
  )
}

// Ícone de informação: um "i" dentro de um círculo.
function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6 shrink-0 text-wt-lime"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 11v6" />
      <path d="M12 7.5v.01" />
    </svg>
  )
}
