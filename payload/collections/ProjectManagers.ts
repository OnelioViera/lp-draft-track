import type { CollectionConfig } from 'payload'

export const ProjectManagers: CollectionConfig = {
  slug: 'project-managers',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name'],
    description: 'List of project managers to choose from when creating or editing jobs.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Project manager display name',
      },
    },
  ],
}
