import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      )
    }

    // Convert Windows path to WSL path
    // C:\Users\... -> /mnt/c/Users/...
    let wslPath = folderPath
    if (folderPath.match(/^[A-Z]:\\/i)) {
      const driveLetter = folderPath[0].toLowerCase()
      wslPath = folderPath.replace(/^[A-Z]:\\/i, `/mnt/${driveLetter}/`)
      wslPath = wslPath.replace(/\\/g, '/')
    }

    console.log('Creating folder:', wslPath)

    // Create the folder if it doesn't exist
    if (!fs.existsSync(wslPath)) {
      fs.mkdirSync(wslPath, { recursive: true })
      return NextResponse.json({
        success: true,
        message: 'Folder created successfully',
        path: folderPath,
        wslPath: wslPath
      })
    } else {
      return NextResponse.json({
        success: true,
        message: 'Folder already exists',
        path: folderPath,
        wslPath: wslPath
      })
    }
  } catch (error: any) {
    console.error('Error creating folder:', error)
    return NextResponse.json(
      { error: 'Failed to create folder', details: error.message },
      { status: 500 }
    )
  }
}
