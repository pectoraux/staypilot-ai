import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { PROPERTY, RESERVATIONS, AI_RECOMMENDATIONS, occupancyForDate } from '@/lib/data'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatMessage { role: 'user' | 'assistant'; content: string }

async function callLLM(systemPrompt: string, userPrompt: string, history?: ChatMessage[]) {
  const zai = await ZAI.create()
  const messages: ChatMessage[] = [{ role: 'assistant', content: systemPrompt }]
  if (history && history.length) messages.push(...history.slice(-8))
  messages.push({ role: 'user', content: userPrompt })
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: 'disabled' },
  })
  return completion.choices[0]?.message?.content ?? ''
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode } = body as { mode: string }

    // ---- WhatsApp AI Concierge ----
    if (mode === 'concierge') {
      const { message, history } = body as { message: string; history?: ChatMessage[] }
      const today = new Date().toISOString().slice(0, 10)
      const occ = occupancyForDate(today)
      const system = `You are ${PROPERTY.name}'s AI WhatsApp Concierge — warm, concise, and helpful (Ghanaian hospitality tone, use "Akwaaba" naturally). 
Property: ${PROPERTY.name}, ${PROPERTY.location}. 18 rooms. WiFi: AkwaabaGuest / password: Welcome2024. Breakfast 7-10am. Checkout 11am, late checkout on request. Pool 6am-10pm. Airport pickup available (₵180).
Live occupancy today: ${occ}%. 
Answer guest questions about directions, WiFi, breakfast, tourism, room service, late checkout, airport pickup, nearby restaurants, emergency contacts. Keep replies under 90 words, friendly, use emojis sparingly. If a request needs staff (maintenance, billing dispute, complaint), say you'll connect them to the front desk.`
      const reply = await callLLM(system, message, history)
      return NextResponse.json({ reply })
    }

    // ---- AI Campaign Generator ----
    if (mode === 'campaign') {
      const { goal } = body as { goal: string }
      const system = `You are the AI Marketing Manager for ${PROPERTY.name}, a boutique guest house in ${PROPERTY.location}. Generate a complete marketing campaign plan to achieve the owner's goal. Respond as STRICT JSON only (no markdown, no prose) with this exact shape:
{
  "name": string,
  "channel": "WhatsApp" | "SMS" | "Email" | "Facebook" | "Instagram",
  "audience": string (specific segment description),
  "audienceSize": number (realistic estimate 5-2000),
  "message": string (the actual message, warm Ghanaian tone, use {name} placeholder, include offer),
  "discount": number (0-30),
  "timing": string (when to send),
  "followUp": string (follow-up plan),
  "abTest": string (A/B variant idea),
  "expectedOccupancyLift": number (percentage),
  "expectedRevenue": number (in GHS)
}`
      const reply = await callLLM(system, `Owner's goal: "${goal}". Property has 18 rooms. Currency is GHS (₵). Generate the campaign JSON now.`)
      let parsed: unknown = null
      try {
        const cleaned = reply.replace(/```json/gi, '').replace(/```/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch {
        parsed = null
      }
      return NextResponse.json({ raw: reply, campaign: parsed })
    }

    // ---- Review Reply Generator ----
    if (mode === 'review-reply') {
      const { platform, rating, text } = body as { platform: string; rating: number; text: string }
      const system = `You are the Reputation Manager for ${PROPERTY.name}. Write a thoughtful, professional reply to a ${rating}-star ${platform} review. If positive: thank warmly and invite back. If negative: apologize sincerely, acknowledge the specific issue, explain the fix, and offer to make it right. Keep under 70 words. No emojis if rating <= 2. Output only the reply text.`
      const reply = await callLLM(system, `Review (${rating}★ on ${platform}): "${text}"`)
      return NextResponse.json({ reply })
    }

    // ---- Daily AI Brief (General Manager) ----
    if (mode === 'brief') {
      const today = new Date().toISOString().slice(0, 10)
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
      const t = tomorrow.toISOString().slice(0, 10)
      const occToday = occupancyForDate(today)
      const occTomorrow = occupancyForDate(t)
      const upcoming = RESERVATIONS.filter(r => r.checkIn >= today && r.status === 'Confirmed').slice(0, 5)
      const otaShare = Math.round(RESERVATIONS.filter(r => ['Airbnb', 'Booking.com', 'Expedia', 'Agoda'].includes(r.source)).length / RESERVATIONS.length * 100)
      const system = `You are Nana, the General Manager AI agent for ${PROPERTY.name}. Produce a crisp morning brief for the owner. Use bullet points and bold headers. Sections: 📊 Today's Snapshot, ⚠️ Threats, 💡 Top 3 Recommendations, 📈 Revenue Outlook. Be specific with numbers. Under 220 words.`
      const userPrompt = `Data — Occupancy today: ${occToday}%, tomorrow: ${occTomorrow}%. OTA dependency: ${otaShare}%. Upcoming check-ins: ${upcoming.length}. Active recommendations: ${AI_RECOMMENDATIONS.length}. Rooms: 18. Write the brief.`
      const reply = await callLLM(system, userPrompt)
      return NextResponse.json({ reply })
    }

    // ---- Free-form agent chat ----
    if (mode === 'agent-chat') {
      const { agentRole, message, history } = body as { agentRole: string; message: string; history?: ChatMessage[] }
      const system = `You are ${agentRole} at ${PROPERTY.name}, an AI agent in a Revenue Operating System for guest houses. Be specific, data-driven, concise (under 120 words), and action-oriented. Reference real metrics where helpful. Property: 18 rooms, ${PROPERTY.location}.`
      const reply = await callLLM(system, message, history)
      return NextResponse.json({ reply })
    }

    // ---- Pricing recommendation rationale ----
    if (mode === 'pricing') {
      const { roomName, currentRate, occupancy } = body as { roomName: string; currentRate: number; occupancy: number }
      const system = `You are the Pricing Analyst AI for ${PROPERTY.name}. Given a room's current rate and occupancy, recommend a rate adjustment with a one-line rationale. Respond STRICT JSON: {"suggestedRate": number, "changePct": number, "reason": string, "confidence": number}. Currency GHS.`
      const reply = await callLLM(system, `Room: ${roomName}, current rate: ₵${currentRate}, current occupancy: ${occupancy}%. Competitor avg nearby: ₵980.`)
      let parsed: unknown = null
      try { parsed = JSON.parse(reply.replace(/```json/gi, '').replace(/```/g, '').trim()) } catch { parsed = null }
      return NextResponse.json({ raw: reply, pricing: parsed })
    }

    return NextResponse.json({ error: 'Unknown mode' }, { status: 400 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
