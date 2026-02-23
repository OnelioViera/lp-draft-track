import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

/** Use Windows path as-is on Windows; convert to WSL path on Linux. */
function toServerPath(windowsPath: string): string {
  if (process.platform === 'win32') {
    return path.normalize(windowsPath)
  }
  if (windowsPath.match(/^[A-Z]:\\/i)) {
    const driveLetter = windowsPath[0].toLowerCase()
    return windowsPath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`).replace(/\\/g, '/')
  }
  return windowsPath.replace(/\\/g, '/')
}

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      )
    }

    // When deployed (e.g. Vercel), we cannot create folders on the user's PC
    if (folderPath.match(/^[A-Z]:\\/i) && process.platform !== 'win32') {
      return NextResponse.json(
        {
          error: 'Folder creation only works when running the app locally',
          details: 'Run "npm run dev" on your Windows PC. Deployed versions cannot create folders on your computer.',
          code: 'LOCAL_ONLY',
        },
        { status: 503 }
      )
    }

    const serverPath = toServerPath(folderPath)

    console.log('Creating folder:', { serverPath, platform: process.platform })

    if (!fs.existsSync(serverPath)) {
      fs.mkdirSync(serverPath, { recursive: true })
      return NextResponse.json({
        success: true,
        message: 'Folder created successfully',
        path: folderPath,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Folder already exists',
        path: folderPath,
      })
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder', details: msg },
      { status: 500 }
    )
  }
}
