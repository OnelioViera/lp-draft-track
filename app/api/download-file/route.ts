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
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      )
    }

    const serverPath = toServerPath(filePath)

    if (!fs.existsSync(serverPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    const fileBuffer = fs.readFileSync(serverPath)
    const fileName = path.basename(serverPath)
    const extension = path.extname(fileName).toLowerCase()

    // Determine content type
    let contentType = 'application/octet-stream'
    if (extension === '.pdf') contentType = 'application/pdf'
    else if (['.jpg', '.jpeg'].includes(extension)) contentType = 'image/jpeg'
    else if (extension === '.png') contentType = 'image/png'
    else if (extension === '.dwg') contentType = 'application/acad'

    // Return file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'Failed to download file', details: msg },
      { status: 500 }
    )
  }
}
