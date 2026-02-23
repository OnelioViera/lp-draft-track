import type { CollectionConfig } from 'payload'

export const Jobs: CollectionConfig = {
  slug: 'jobs',
  admin: {
    useAsTitle: 'jobName',
    defaultColumns: ['jobType', 'jobNumber', 'jobName', 'customerName', 'status', 'dateStarted'],
  },
  fields: [
    {
      name: 'jobType',
      type: 'select',
      required: true,
      defaultValue: 'lindsay-precast',
      index: true,
      admin: {
        description: 'Lindsay Precast or Lindsay Renewables',
      },
      options: [
        { label: 'Lindsay Precast', value: 'lindsay-precast' },
        { label: 'Lindsay Renewables', value: 'lindsay-renewables' },
      ],
    },
    {
      name: 'jobNumber',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Unique job identifier',
      },
    },
    {
      name: 'jobName',
      type: 'text',
      required: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'jobLocation',
      type: 'text',
      required: false,
    },
    {
      name: 'projectManager',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Project Manager assigned to this job',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'In Review',
          value: 'in-review',
        },
        {
          label: 'Complete',
          value: 'complete',
        },
        {
          label: 'On Hold',
          value: 'on-hold',
        },
      ],
    },
    {
      name: 'dateStarted',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed job description',
      },
    },
    {
      name: 'fileLocationPath',
      type: 'text',
      admin: {
        description: 'Network path or location where files are stored',
      },
    },
    {
      name: 'attachments',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      admin: {
        description: 'DWG, DXF, PDF, PNG, JPG files',
      },
    },
  ],
}

// Media collection for file uploads
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
      'application/acad',
      'application/x-acad',
      'application/autocad_dwg',
      'image/x-dwg',
      'application/dwg',
      'application/x-dwg',
      'application/x-autocad',
      'image/vnd.dwg',
      'drawing/dwg',
      'application/dxf',
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
