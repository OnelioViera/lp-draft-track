import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { folderPath, subfolderName } = await request.json()

    if (!folderPath || !subfolderName) {
      return NextResponse.json(
        { error: 'Folder path and subfolder name are required' },
        { status: 400 }
      )
    }

    // Sanitize subfolder name
    const sanitizedName = subfolderName.replace(/[\\/:*?"<>|]/g, '-')

    // Create full path
    const fullPath = path.join(folderPath, sanitizedName)

    // Convert Windows path to WSL path
    let wslPath = fullPath
    if (fullPath.match(/^[A-Z]:\\/i)) {
      const driveLetter = fullPath[0].toLowerCase()
      wslPath = fullPath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`)
      wslPath = wslPath.replace(/\\/g, '/')
    }

    console.log('Creating subfolder:', wslPath)

    // Create the subfolder
    if (!fs.existsSync(wslPath)) {
      fs.mkdirSync(wslPath, { recursive: true })
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
  } catch (error: any) {
    console.error('Error creating subfolder:', error)
    return NextResponse.json(
      { error: 'Failed to create subfolder', details: error.message },
      { status: 500 }
    )
  }
}
