import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      )
    }

    // Convert Windows path to WSL path
    let wslPath = filePath
    if (filePath.match(/^[A-Z]:\\/i)) {
      const driveLetter = filePath[0].toLowerCase()
      wslPath = filePath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`)
      wslPath = wslPath.replace(/\\/g, '/')
    }

    // Check if file exists
    if (!fs.existsSync(wslPath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Read file
    const fileBuffer = fs.readFileSync(wslPath)
    const fileName = path.basename(wslPath)
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
  } catch (error: any) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { error: 'Failed to download file', details: error.message },
      { status: 500 }
    )
  }
}
