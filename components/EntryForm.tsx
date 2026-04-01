'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { EntryType } from '@/lib/types'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const TYPES: { value: EntryType; label: string; emoji: string }[] = [
  { value: 'journal', label: 'Journal', emoji: '📝' },
  { value: 'meeting', label: 'Meeting', emoji: '🤝' },
  { value: 'knowledge', label: 'Knowledge', emoji: '💡' },
]

interface EntryFormProps {
  onSuccess: () => void
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [content, setContent] = useState('')
  const [type, setType] = useState<EntryType>('journal')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    const { error } = await supabase.from('entries').insert({
      content: content.trim(),
      type,
      status: 'raw',
    })

    if (!error) {
      setContent('')
      onSuccess()
    }
    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setType(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              type === t.value
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Qu'est-ce qui s'est passé ? Une décision, une idée, une note de réunion..."
        className="min-h-[100px] resize-none text-sm"
        autoFocus
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">⌘ + Entrée pour sauvegarder</span>
        <Button type="submit" disabled={loading || !content.trim()} size="sm">
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  )
}
