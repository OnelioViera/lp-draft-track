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
    const { folderPath } = await request.json()

    if (!folderPath) {
      return NextResponse.json(
        { error: 'No folder path provided' },
        { status: 400 }
      )
    }

    const serverPath = toServerPath(folderPath)

    if (!fs.existsSync(serverPath)) {
      return NextResponse.json({
        success: true,
        files: [],
        folders: [],
        message: 'Folder does not exist yet'
      })
    }

    const items = fs.readdirSync(serverPath)
    const files: any[] = []
    const folders: any[] = []

    items.forEach(item => {
      const itemPath = path.join(serverPath, item)
      const stats = fs.statSync(itemPath)
      const windowsItemPath = path.join(folderPath, item).replace(/\//g, '\\')
      if (stats.isDirectory()) {
        folders.push({
          name: item,
          path: windowsItemPath,
          type: 'folder',
          created: stats.birthtime,
          modified: stats.mtime,
        })
      } else {
        files.push({
          name: item,
          path: windowsItemPath,
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
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Failed to list files', details: msg },
      { status: 500 }
    )
  }
}
