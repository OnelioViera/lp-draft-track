import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { folderPath } = await request.json()

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

    // Check if folder exists
    if (!fs.existsSync(wslPath)) {
      return NextResponse.json({
        success: true,
        files: [],
        folders: [],
        message: 'Folder does not exist yet'
      })
    }

    // Read directory contents
    const items = fs.readdirSync(wslPath)
    const files: any[] = []
    const folders: any[] = []

    items.forEach(item => {
      const itemPath = path.join(wslPath, item)
      const stats = fs.statSync(itemPath)

      if (stats.isDirectory()) {
        folders.push({
          name: item,
          path: path.join(folderPath, item),
          type: 'folder',
          created: stats.birthtime,
          modified: stats.mtime,
        })
      } else {
        files.push({
          name: item,
          path: path.join(folderPath, item),
          type: 'file',
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          extension: path.extname(item).toLowerCase(),
        })
      }
    })

    return NextResponse.json({
      success: true,
      files,
      folders,
      folderPath,
      wslPath
    })
  } catch (error: any) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files', details: error.message },
      { status: 500 }
    )
  }
}
