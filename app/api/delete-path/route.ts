import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function toServerPath(windowsPath: string): string {
  if (process.platform === 'win32') return windowsPath
  if (windowsPath.match(/^[A-Z]:\\/i)) {
    const driveLetter = windowsPath[0].toLowerCase()
    return windowsPath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`).replace(/\\/g, '/')
  }
  return windowsPath.replace(/\\/g, '/')
}

export async function POST(request: Request) {
  try {
    const { path: itemPath, type } = await request.json()

    if (!itemPath) {
      return NextResponse.json(
        { error: 'Path is required' },
        { status: 400 }
      )
    }

    const serverPath = toServerPath(itemPath)

    if (!fs.existsSync(serverPath)) {
      return NextResponse.json(
        { error: type === 'folder' ? 'Folder' : 'File' + ' not found' },
        { status: 404 }
      )
    }

    const stat = fs.statSync(serverPath)
    if (type === 'folder' && !stat.isDirectory()) {
      return NextResponse.json({ error: 'Path is not a folder' }, { status: 400 })
    }
    if (type === 'file' && !stat.isFile()) {
      return NextResponse.json({ error: 'Path is not a file' }, { status: 400 })
    }

    if (stat.isDirectory()) {
      fs.rmSync(serverPath, { recursive: true })
    } else {
      fs.unlinkSync(serverPath)
    }

    return NextResponse.json({
      success: true,
      message: type === 'folder' ? 'Folder deleted' : 'File deleted',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error deleting path:', error)
    return NextResponse.json(
      { error: 'Failed to delete', details: message },
      { status: 500 }
    )
  }
}
