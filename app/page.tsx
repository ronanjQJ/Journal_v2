'use client'

import { useState } from 'react'
import EntryForm from '@/components/EntryForm'
import TabView from '@/components/TabView'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <header>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Journal PM</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Capture rapide. Rien ne se perd.</p>
        </header>

        <section className="border border-zinc-100 dark:border-zinc-800 rounded-xl p-4">
          <EntryForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </section>

        <section>
          <TabView refreshKey={refreshKey} />
        </section>
      </div>
    </div>
  )
}
