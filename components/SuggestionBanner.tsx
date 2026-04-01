'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface Suggestion {
  entryId: string
  type: 'action' | 'event' | 'none'
  label: string
  date_hint: string | null
}

interface SuggestionBannerProps {
  suggestion: Suggestion
  onDone: () => void
}

function buildTeamsLink(label: string, dateHint: string | null): string {
  let startTime = new Date()
  startTime.setDate(startTime.getDate() + 1)
  startTime.setHours(10, 0, 0, 0)

  if (dateHint) {
    const parsed = new Date(dateHint)
    if (!isNaN(parsed.getTime())) startTime = parsed
  }

  const subject = encodeURIComponent(label)
  const time = encodeURIComponent(startTime.toISOString().slice(0, 19))
  return `https://teams.microsoft.com/l/meeting/new?subject=${subject}&startTime=${time}`
}

export default function SuggestionBanner({ suggestion, onDone }: SuggestionBannerProps) {
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'action' | 'event' | 'archived') {
    setLoading(true)

    const update: Record<string, string | null> = { status: action }

    if (action === 'action') {
      update.next_step = suggestion.label
    } else if (action === 'event') {
      const teamsLink = buildTeamsLink(suggestion.label, suggestion.date_hint)
      update.next_step = suggestion.label
      update.date_hint = suggestion.date_hint
      update.teams_link = teamsLink
      window.open(teamsLink, '_blank')
    }

    await supabase.from('entries').update(update).eq('id', suggestion.entryId)

    setLoading(false)
    onDone()
  }

  const typeLabel = suggestion.type === 'event' ? '📅 Événement détecté' : '⚡ Action détectée'

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-3 space-y-2.5">
      <div className="text-xs font-medium text-amber-700 dark:text-amber-400">{typeLabel}</div>
      <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{suggestion.label}</p>
      {suggestion.date_hint && (
        <p className="text-xs text-zinc-500">📅 {suggestion.date_hint}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-0.5">
        <button
          onClick={() => handleAction('action')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors dark:bg-white dark:text-zinc-900"
        >
          ⚡ Valider comme action
        </button>
        <button
          onClick={() => handleAction('event')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          📅 Planifier
        </button>
        <button
          onClick={() => handleAction('archived')}
          disabled={loading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-500 hover:bg-zinc-200 disabled:opacity-50 transition-colors dark:bg-zinc-800 dark:text-zinc-400"
        >
          ✕ Ignorer
        </button>
      </div>
    </div>
  )
}
