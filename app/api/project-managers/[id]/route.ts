import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    const body = await request.json()
    const { name } = body
    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }
    const pm = await payload.update({
      collection: 'project-managers',
      id,
      data: { name: String(name).trim() },
    })
    return NextResponse.json(pm)
  } catch (error) {
    console.error('Error updating project manager:', error)
    return NextResponse.json(
      { error: 'Failed to update project manager' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'project-managers',
      id,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project manager:', error)
    return NextResponse.json(
      { error: 'Failed to delete project manager' },
      { status: 500 }
    )
  }
}
