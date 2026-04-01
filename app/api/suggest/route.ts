import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json()

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Tu es un assistant pour Product Manager. Analyse la note suivante et identifie s'il y a une action concrète à faire ou un rendez-vous à planifier.

Réponds UNIQUEMENT avec du JSON valide, sans texte autour, en choisissant exactement un de ces formats :
{"type":"action","label":"description courte de l'action","date_hint":null}
{"type":"event","label":"titre du rendez-vous","date_hint":"date/heure si mentionnée"}
{"type":"none","label":"","date_hint":null}

Note : ${content}`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonText = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const match = jsonText.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ type: 'none', label: '', date_hint: null })
    const suggestion = JSON.parse(match[0])
    return NextResponse.json(suggestion)
  } catch (err) {
    console.error('[/api/suggest error]', err)
    return NextResponse.json({ type: 'none', label: '', date_hint: null })
  }
}
