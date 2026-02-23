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
    const { path: itemPath, newName } = await request.json()

    if (!itemPath || !newName || !newName.trim()) {
      return NextResponse.json(
        { error: 'Path and new name are required' },
        { status: 400 }
      )
    }

    const sanitizedName = newName.trim().replace(/[\\/:*?"<>|]/g, '-')
    if (!sanitizedName) {
      return NextResponse.json(
        { error: 'Invalid name after sanitization' },
        { status: 400 }
      )
    }

    const serverPath = toServerPath(itemPath)

    if (!fs.existsSync(serverPath)) {
      return NextResponse.json(
        { error: 'File or folder not found' },
        { status: 404 }
      )
    }

    const parentDir = path.dirname(serverPath)
    const newPath = path.join(parentDir, sanitizedName)

    if (fs.existsSync(newPath)) {
      return NextResponse.json(
        { error: 'A file or folder with that name already exists' },
        { status: 400 }
      )
    }

    fs.renameSync(serverPath, newPath)

    // Return new Windows-style path for the client (parent + new name)
    const windowsParent = path.dirname(itemPath)
    const newWindowsPath = path.join(windowsParent, sanitizedName).replace(/\//g, '\\')

    return NextResponse.json({
      success: true,
      message: 'Renamed successfully',
      newPath: newWindowsPath,
      newName: sanitizedName,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error renaming path:', error)
    return NextResponse.json(
      { error: 'Failed to rename', details: message },
      { status: 500 }
    )
  }
}
