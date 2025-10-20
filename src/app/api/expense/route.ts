import { ExpenseClientRepo } from '@/lib/supabase/queries/client/expense.client'
import { ExpenseServerRepo } from '@/lib/supabase/queries/server/expense.server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const storeid = searchParams.get('storeid')

  if (!storeid) return NextResponse.json({ error: 'Missing storeid' }, { status: 400 })

  try {
    const data = await ExpenseServerRepo.getAll(storeid)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json()

  try {
    const data = await ExpenseClientRepo.create(body)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
