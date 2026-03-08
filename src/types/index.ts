// Shared TypeScript types for the application

export interface Entry {
  id: string;
  title: string;
  body: string;
  date: Date | string;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  projectId?: string | null;
  project?: Project | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  status: ProjectStatus;
  liveUrl?: string | null;
  repoUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  _count?: {
    entries: number;
    resources: number;
  };
}

export type ProjectStatus = "Idea" | "Building" | "Shipped" | "Paused";

export interface Resource {
  id: string;
  title: string;
  url: string;
  category: ResourceCategory;
  notes?: string | null;
  isFavorite: boolean;
  isRead: boolean;
  tags: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type ResourceCategory = "Article" | "Video" | "Docs" | "Course" | "Other";

export interface DashboardStats {
  totalEntries: number;
  totalProjects: number;
  totalResources: number;
  currentStreak: number;
  activityData: ActivityDataPoint[];
  topTags: TagCount[];
}

export interface ActivityDataPoint {
  week: string;
  entries: number;
}

export interface TagCount {
  tag: string;
  count: number;
}
