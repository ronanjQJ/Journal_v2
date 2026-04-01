'use client'

import { useEffect, useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { Entry } from '@/lib/types'
import EntryCard from './EntryCard'

const TABS = [
  { value: 'all', label: '📋 Tout' },
  { value: 'action', label: '🔴 À traiter' },
] as const

type TabValue = (typeof TABS)[number]['value']

interface TabViewProps {
  refreshKey: number
}

export default function TabView({ refreshKey }: TabViewProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEntries = useCallback(async (tab: TabValue) => {
    setLoading(true)
    let query = supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (tab === 'action') {
      query = query.eq('status', 'action')
    }

    const { data } = await query
    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEntries(activeTab)
  }, [activeTab, refreshKey, fetchEntries])

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
      <TabsList className="w-full justify-start gap-1 h-auto p-1 bg-zinc-100 dark:bg-zinc-800">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-sm">
              Aucune entrée pour l'instant.
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onArchive={tab.value === 'action' ? () => fetchEntries('action') : undefined}
                />
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
