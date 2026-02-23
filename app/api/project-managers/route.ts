import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'project-managers',
      limit: 500,
      sort: 'name',
    })
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching project managers:', error)
    return NextResponse.json({ docs: [] })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const { name } = body
    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    const pm = await payload.create({
      collection: 'project-managers',
      data: { name: String(name).trim() },
    })
    return NextResponse.json(pm)
  } catch (error) {
    console.error('Error creating project manager:', error)
    return NextResponse.json(
      { error: 'Failed to create project manager' },
      { status: 500 }
    )
  }
}
