import { useState } from 'react'
import { PNG_HEIGHT, PNG_WIDTH, downloadPng } from '../lib/export.js'

// Botão para baixar o background em PNG.
export default function ExportPanel({ config, theme }) {
  const [saving, setSaving] = useState(false)

  async function handleDownload() {
    setSaving(true)
    try {
      await downloadPng(config, theme)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-wt-line bg-wt-panel p-5 sm:p-6">
      <div>
        <h2 className="font-display text-lg">Baixar</h2>
        <p className="text-sm text-wt-muted">
          PNG {PNG_WIDTH}×{PNG_HEIGHT} · tema {theme}
        </p>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={saving}
        className="rounded-full bg-wt-lime px-8 py-3 font-display text-wt-ink transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? 'Gerando...' : 'Baixar PNG'}
      </button>
    </section>
  )
}
