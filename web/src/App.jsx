import { useMemo, useState } from 'react'
import Controls from './components/Controls.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import HeroPreview from './components/HeroPreview.jsx'
import Navbar from './components/Navbar.jsx'
import { DEFAULT_CONFIG, generate } from './lib/generate.js'
import { makePalette } from './lib/palette.js'
import { newSeed } from './lib/random.js'

export default function App() {
  // A config é tudo o que define um background: a mesma config gera sempre a mesma imagem.
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG, seed: newSeed() })
  const [theme, setTheme] = useState('dark')

  // Só regenera o SVG quando a config ou o tema mudam.
  const svg = useMemo(() => generate(config, theme), [config, theme])
  const palette = makePalette(config.hue, config.secondaryHue, theme)

  function updateConfig(changes) {
    setConfig((current) => ({ ...current, ...changes }))
  }

  function generateAnother() {
    updateConfig({ seed: newSeed() })
  }

  return (
    // Ocupa a largura toda da tela (só com uma margem nas laterais).
    <div className="flex min-h-screen w-full flex-col gap-6 px-6 py-6 lg:px-10 lg:py-8 2xl:px-16">
      <Navbar pagina="gerador" />
      <Header etiqueta="Workshop de Web Fundamentos" titulo="Gerador de Backgrounds" />

      <main className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start 2xl:grid-cols-[1fr_480px] 2xl:gap-10">
        <div className="flex flex-col gap-6">
          <HeroPreview
            svg={svg}
            palette={palette}
            textArea={config.textArea}
            theme={theme}
            onThemeChange={setTheme}
          />
          <ExportPanel config={config} theme={theme} />
        </div>
        {/* o painel fica "grudado" no topo quando a página rola */}
        <div className="lg:sticky lg:top-6">
          <Controls config={config} onChange={updateConfig} onGenerate={generateAnother} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
