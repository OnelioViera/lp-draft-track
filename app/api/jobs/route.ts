import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sanitizeJobBody } from '@/lib/job-api'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const jobs = await payload.find({
      collection: 'jobs',
      limit: 1000,
      sort: '-createdAt',
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ docs: [] })
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()
    const data = sanitizeJobBody(body)
    const job = await payload.create({
      collection: 'jobs',
      data,
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
