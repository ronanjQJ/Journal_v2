'use client'

import { useState } from 'react'
import { Entry, EntryType, EntryStatus } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const TYPE_CONFIG: Record<EntryType, { label: string; emoji: string; className: string }> = {
  journal: { label: 'Journal', emoji: '📝', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300' },
  meeting: { label: 'Meeting', emoji: '🤝', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300' },
  knowledge: { label: 'Knowledge', emoji: '💡', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300' },
}

const STATUS_CONFIG: Record<EntryStatus, { label: string; className: string }> = {
  raw: { label: 'Brut', className: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400' },
  action: { label: 'À traiter', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300' },
  event: { label: 'Événement', className: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300' },
  archived: { label: 'Archivé', className: 'bg-zinc-50 text-zinc-400 border-zinc-100 dark:bg-zinc-900 dark:text-zinc-500' },
}

function formatDate(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface EntryCardProps {
  entry: Entry
  onArchive?: () => void
}

export default function EntryCard({ entry, onArchive }: EntryCardProps) {
  const [loading, setLoading] = useState(false)
  const typeConfig = entry.type ? TYPE_CONFIG[entry.type] : null
  const statusConfig = STATUS_CONFIG[entry.status]

  async function archive() {
    setLoading(true)
    await supabase.from('entries').update({ status: 'archived' }).eq('id', entry.id)
    onArchive?.()
  }

  return (
    <Card className="border-zinc-100 shadow-none hover:border-zinc-200 transition-colors dark:border-zinc-800">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {typeConfig && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${typeConfig.className}`}>
                {typeConfig.emoji} {typeConfig.label}
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.className}`}>
              {statusConfig.label}
            </span>
          </div>
          <span className="text-xs text-zinc-400 shrink-0">{formatDate(entry.created_at)}</span>
        </div>

        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-4">
          {entry.content}
        </p>

        {entry.next_step && (
          <div className="mt-3 flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 rounded-md px-2.5 py-1.5">
            <span className="shrink-0">→</span>
            <span>{entry.next_step}</span>
          </div>
        )}

        {entry.date_hint && (
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1">
            <span>📅</span>
            <span>{entry.date_hint}</span>
          </div>
        )}

        {entry.teams_link && (
          <a
            href={entry.teams_link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            <span>🔗</span>
            <span>Ouvrir dans Teams</span>
          </a>
        )}

        {onArchive && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
            <button
              onClick={archive}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors dark:bg-emerald-950 dark:text-emerald-400"
            >
              ✓ Traité
            </button>
            <button
              onClick={archive}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-100 text-zinc-500 hover:bg-zinc-200 disabled:opacity-50 transition-colors dark:bg-zinc-800 dark:text-zinc-400"
            >
              🗑 Ignorer
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
