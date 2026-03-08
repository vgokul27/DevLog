import { z } from 'zod';

// Entry validation schemas
export const createEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  body: z.string().min(1, 'Content is required'),
  date: z.string().optional().transform((val) => val ? new Date(val).toISOString() : new Date().toISOString()),
  tags: z.array(z.string()).default([]),
  projectId: z.string().optional().nullable(),
});

export const updateEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  body: z.string().min(1, 'Content is required').optional(),
  date: z.string().optional().transform((val) => val ? new Date(val).toISOString() : undefined),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional().nullable(),
});

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type UpdateEntryInput = z.infer<typeof updateEntrySchema>;

// Project validation schemas
export const projectStatusEnum = z.enum(['Idea', 'Building', 'Shipped', 'Paused']);

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).min(1, 'At least one technology is required'),
  status: projectStatusEnum,
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  repoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name is too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  techStack: z.array(z.string()).min(1, 'At least one technology is required').optional(),
  status: projectStatusEnum.optional(),
  liveUrl: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  repoUrl: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// Resource validation schemas
export const resourceCategoryEnum = z.enum(['Article', 'Video', 'Docs', 'Course', 'Other']);

export const createResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  url: z.string().url('Invalid URL'),
  category: resourceCategoryEnum,
  notes: z.string().optional(),
  isFavorite: z.boolean().default(false),
  isRead: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  entryId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export const updateResourceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long').optional(),
  url: z.string().url('Invalid URL').optional(),
  category: resourceCategoryEnum.optional(),
  notes: z.string().optional().nullable(),
  isFavorite: z.boolean().optional(),
  isRead: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
