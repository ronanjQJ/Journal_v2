export type EntryType = 'journal' | 'meeting' | 'knowledge'
export type EntryStatus = 'raw' | 'action' | 'event' | 'archived'

export interface Entry {
  id: string
  created_at: string
  content: string
  type: EntryType | null
  status: EntryStatus
  next_step: string | null
  date_hint: string | null
  teams_link: string | null
}
