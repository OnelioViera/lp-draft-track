import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { sanitizeJobBody } from '@/lib/job-api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const job = await payload.findByID({
      collection: 'jobs',
      id,
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()
    const data = sanitizeJobBody(body)
    const job = await payload.update({
      collection: 'jobs',
      id,
      data,
    })
    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'jobs',
      id,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}
