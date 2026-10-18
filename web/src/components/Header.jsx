export default function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <img src="/logo.png" alt="Work in Tech" className="h-14 w-auto self-start sm:h-16" />

      <div className="sm:text-right">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-wt-lime uppercase sm:justify-end">
          <span className="size-2 rounded-full bg-wt-lime" />
          <span className="h-px w-6 bg-wt-lime" />
          Workshop de Frontend
        </p>
        <h1 className="font-display text-2xl leading-tight sm:text-3xl">Gerador de Backgrounds</h1>
      </div>
    </header>
  )
}
