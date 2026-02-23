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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folderPath = formData.get('folderPath') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!folderPath) {
      return NextResponse.json(
        { error: 'No folder path provided' },
        { status: 400 }
      )
    }

    const serverPath = toServerPath(folderPath)

    // Optional: path relative to folderPath (e.g. "CAD/plan.dwg") for folder uploads
    const relativePath = (formData.get('relativePath') as string) || ''
    const targetPath = relativePath
      ? path.join(serverPath, relativePath.replace(/\//g, path.sep))
      : path.join(serverPath, file.name)

    const parentDir = path.dirname(targetPath)
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    fs.writeFileSync(targetPath, buffer)

    console.log('File uploaded:', targetPath)

    const reportedPath = relativePath
      ? folderPath + '\\' + relativePath.replace(/\//g, '\\')
      : folderPath + '\\' + file.name
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileName: file.name,
      filePath: reportedPath,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: msg },
      { status: 500 }
    )
  }
}
