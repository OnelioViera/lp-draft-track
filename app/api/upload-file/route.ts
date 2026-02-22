import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

    // Convert Windows path to WSL path
    let wslPath = folderPath
    if (folderPath.match(/^[A-Z]:\\/i)) {
      const driveLetter = folderPath[0].toLowerCase()
      wslPath = folderPath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`)
      wslPath = wslPath.replace(/\\/g, '/')
    }

    // Ensure the folder exists
    if (!fs.existsSync(wslPath)) {
      fs.mkdirSync(wslPath, { recursive: true })
    }

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create file path
    const filePath = path.join(wslPath, file.name)

    // Write file to disk
    fs.writeFileSync(filePath, buffer)

    console.log('File uploaded:', filePath)

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileName: file.name,
      filePath: folderPath + '\\' + file.name,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    )
  }
}
