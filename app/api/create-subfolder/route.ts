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
    const { folderPath, subfolderName } = await request.json()

    if (!folderPath || !subfolderName) {
      return NextResponse.json(
        { error: 'Folder path and subfolder name are required' },
        { status: 400 }
      )
    }

    const sanitizedName = subfolderName.replace(/[\\/:*?"<>|]/g, '-')
    const fullPath = path.join(folderPath, sanitizedName)
    const serverPath = toServerPath(fullPath)

    console.log('Creating subfolder:', serverPath)

    if (!fs.existsSync(serverPath)) {
      fs.mkdirSync(serverPath, { recursive: true })
      return NextResponse.json({
        success: true,
        message: 'Subfolder created successfully',
        path: fullPath,
        name: sanitizedName
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Subfolder already exists',
        path: fullPath,
        name: sanitizedName
      }, { status: 400 })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error creating subfolder:', error)
    return NextResponse.json(
      { error: 'Failed to create subfolder', details: msg },
      { status: 500 }
    )
  }
}
