'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface EntryFormProps {
  onSuccess: () => void
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)
    const { error: sbError } = await supabase.from('entries').insert({
      content: content.trim(),
      status: 'raw',
    })

    if (sbError) {
      console.error('[Supabase INSERT error]', sbError)
      setError(`Erreur ${sbError.code} : ${sbError.message}`)
    } else {
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
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Qu'est-ce qui s'est passé ? Une décision, une idée, une note de réunion..."
        className="min-h-[100px] resize-none text-sm"
        autoFocus
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">⌘ + Entrée pour sauvegarder</span>
        <Button type="submit" disabled={loading || !content.trim()} size="sm">
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>
    </form>
  )
}
