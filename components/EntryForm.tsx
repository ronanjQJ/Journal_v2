'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import SuggestionBanner, { Suggestion } from './SuggestionBanner'

interface EntryFormProps {
  onSuccess: () => void
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    const { data, error: sbError } = await supabase
      .from('entries')
      .insert({ content: content.trim(), status: 'raw' })
      .select()
      .single()

    if (sbError) {
      console.error('[Supabase INSERT error]', sbError)
      setError(`Erreur ${sbError.code} : ${sbError.message}`)
      setLoading(false)
      return
    }

    const savedContent = data.content
    const savedId = data.id
    setContent('')
    setLoading(false)
    setSuggesting(true)

    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: savedContent }),
      })
      const result = await res.json()

      if (result.type !== 'none') {
        setSuggestion({ entryId: savedId, ...result })
      } else {
        onSuccess()
      }
    } catch (err) {
      console.error('[Suggest error]', err)
      onSuccess()
    } finally {
      setSuggesting(false)
    }
  }

  function handleSuggestionDone() {
    setSuggestion(null)
    onSuccess()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="space-y-3">
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
          <Button type="submit" disabled={loading || suggesting || !content.trim()} size="sm">
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>

      {suggesting && (
        <div className="flex items-center gap-2 text-xs text-zinc-400 py-1 animate-pulse">
          <span>✨</span>
          <span>Analyse en cours...</span>
        </div>
      )}

      {suggestion && (
        <SuggestionBanner suggestion={suggestion} onDone={handleSuggestionDone} />
      )}
    </div>
  )
}
