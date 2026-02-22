# LP Draft Track

CAD Job Management System for Lindsay Precast

## Technology Stack

- **Frontend**: Next.js 15 with App Router
- **Backend/CMS**: Payload CMS 3
- **Database**: MongoDB Atlas
- **File Storage**: Vercel Blob
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Features

- **Job Tracking**: Manage CAD drafting jobs with all essential details
- **Stats Dashboard**: Real-time statistics for Total, Active, In Review, and Complete jobs
- **Advanced Search**: Filter by status, project manager, or search by job details
- **Detail Panel**: Slide-in panel with full job information
- **File Management**: Support for DWG, DXF, PDF, PNG, JPG file attachments
- **Dark Theme**: Industrial/blueprint-inspired dark theme with amber accents

## Job Fields

- Job Number (unique identifier)
- Job Name
- Customer Name
- Job Location
- Project Manager
- Status (Active, In Review, Complete, On Hold)
- Date Started
- Description
- File Location Path
- File Attachments

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Vercel Blob storage token (optional, for file uploads)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```env
MONGODB_URI=your-mongodb-connection-string
PAYLOAD_SECRET=your-secret-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token (optional)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### If `npm` is not recognized

- **Install Node.js**: Download the [LTS version](https://nodejs.org), run the installer, and ensure **"Add to PATH"** is checked. Restart your terminal (and Cursor) after installing.
- **Use the helper script**: From the project folder in PowerShell, run:
  ```powershell
  .\run-dev.ps1
  ```
  This looks for Node in common install locations and starts the dev server.

## Admin Panel

Access the Payload CMS admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

You'll need to create an admin user on first visit.

## API Endpoints

- `GET /api/jobs` - Fetch all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/[id]` - Fetch a specific job
- `PATCH /api/jobs/[id]` - Update a job
- `DELETE /api/jobs/[id]` - Delete a job

## Project Structure

```
lp-draft-track/
├── app/
│   ├── (payload)/
│   │   ├── admin/          # Payload admin panel
│   │   └── api/            # Payload API routes
│   ├── api/
│   │   └── jobs/           # Custom job API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main dashboard
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── custom-popup.tsx    # Custom popup dialogs
│   ├── job-detail-panel.tsx # Job detail slide-in
│   ├── job-table.tsx       # Job registry table
│   └── stats-bar.tsx       # Statistics bar
├── lib/
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── payload/
│   └── collections/        # Payload collections
│       ├── Jobs.ts
│       └── Users.ts
├── payload.config.ts       # Payload configuration
└── next.config.mjs         # Next.js configuration
```

## Building for Production

```bash
npm run build
npm run start
```

## License

Proprietary - Lindsay Precast
