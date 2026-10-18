import { useRef } from 'react'
import { STYLE_GROUPS } from '../lib/generate.js'

const TEXT_AREA_OPTIONS = [
  { id: 'left', label: 'Esquerda' },
  { id: 'center', label: 'Centro' },
]

// Painel com todos os controles do gerador.
export default function Controls({ config, onChange, onGenerate }) {
  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-wt-line bg-wt-panel p-5 sm:p-6">
      <Field label="Cor principal" value={`${config.hue}°`}>
        <HueSlider value={config.hue} onChange={(hue) => onChange({ hue })} label="Cor principal" />
      </Field>

      <Field label="Cor secundária" value={`${config.secondaryHue}°`}>
        <HueSlider
          value={config.secondaryHue}
          onChange={(secondaryHue) => onChange({ secondaryHue })}
          label="Cor secundária"
        />
      </Field>

      <Field label="Estilo">
        {STYLE_GROUPS.map((group) => (
          <StyleCarousel
            key={group.label}
            label={group.label}
            options={group.options}
            selected={config.style}
            onSelect={(style) => onChange({ style })}
          />
        ))}
      </Field>

      <Field label="Intensidade" value={percent(config.intensity)}>
        <Slider value={config.intensity} onChange={(intensity) => onChange({ intensity })} label="Intensidade" />
      </Field>

      <Field label="Suavidade" value={percent(config.softness)}>
        <Slider value={config.softness} onChange={(softness) => onChange({ softness })} label="Suavidade" />
      </Field>

      <Field label="Posição do texto">
        <OptionGroup
          options={TEXT_AREA_OPTIONS}
          selected={config.textArea}
          onSelect={(textArea) => onChange({ textArea })}
        />
      </Field>

      <div className="flex flex-col gap-2 border-t border-wt-line pt-6">
        <button
          type="button"
          onClick={onGenerate}
          className="rounded-full bg-wt-lime px-6 py-4 font-display text-lg text-wt-ink transition hover:brightness-110 active:scale-[0.98]"
        >
          Gerar outro
        </button>
        <p className="text-center text-sm text-wt-muted">semente #{config.seed}</p>
      </div>
    </aside>
  )
}

function Field({ label, value, children }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-bold">
          <span className="size-1.5 rounded-full bg-wt-lime" />
          {label}
        </span>
        {value && <span className="text-wt-muted tabular-nums">{value}</span>}
      </div>
      {children}
    </div>
  )
}

// Uma linha de opções que rola para o lado (carrossel), com setas para navegar.
// Assim cada grupo de estilos ocupa uma linha só, em vez de quebrar para baixo.
function StyleCarousel({ label, options, selected, onSelect }) {
  const rowRef = useRef(null)

  // Rola a linha um pouco menos que a largura visível, para dar contexto.
  function scroll(direction) {
    const row = rowRef.current
    row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs tracking-[0.15em] text-wt-muted uppercase">{label}</span>
        <div className="flex gap-1">
          <ArrowButton onClick={() => scroll(-1)} label={`Voltar em ${label}`}>‹</ArrowButton>
          <ArrowButton onClick={() => scroll(1)} label={`Avançar em ${label}`}>›</ArrowButton>
        </div>
      </div>

      {/* a máscara apaga suavemente a borda direita, indicando que tem mais opções */}
      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x gap-2 overflow-x-auto pr-8 [mask-image:linear-gradient(to_right,black_85%,transparent)]"
      >
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition ${
              selected === option.id
                ? 'border-wt-lime bg-wt-lime text-wt-ink'
                : 'border-wt-line text-wt-paper hover:border-wt-lime'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function ArrowButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-7 items-center justify-center rounded-full border border-wt-line text-lg leading-none text-wt-paper transition hover:border-wt-lime hover:text-wt-lime"
    >
      {children}
    </button>
  )
}

// Slider de cor: a trilha mostra o arco-íris e a bolinha fica da cor escolhida.
function HueSlider({ value, onChange, label }) {
  return (
    <input
      type="range"
      min="0"
      max="359"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="hue-slider w-full"
      style={{ '--thumb-color': `hsl(${value}, 85%, 55%)` }}
      aria-label={label}
    />
  )
}

// Slider de 0 a 1 (salvo com uma casa decimal, ex: 0.6).
function Slider({ value, onChange, label }) {
  return (
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-wt-lime"
      aria-label={label}
    />
  )
}

function OptionGroup({ options, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
            selected === option.id
              ? 'border-wt-lime bg-wt-lime text-wt-ink'
              : 'border-wt-line text-wt-paper hover:border-wt-lime'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function percent(value) {
  return `${Math.round(value * 100)}%`
}
