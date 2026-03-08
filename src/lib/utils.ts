import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging Tailwind CSS classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to a readable string
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'just now';
}

// Truncate text to a specified length
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

// Parse JSON string safely
export function parseJSON<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

// Get unique tags from an array of tag arrays
export function getUniqueTags(items: Array<{ tags: string[] }>): string[] {
  const allTags = items.flatMap(item => item.tags);
  return Array.from(new Set(allTags)).sort();
}

// Calculate streak of consecutive days
export function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = dates
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Normalize dates to start of day
  const normalizedDates = sortedDates.map(d => {
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized.getTime();
  });

  // Remove duplicates
  const uniqueDates = Array.from(new Set(normalizedDates));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  // Check if most recent entry is today or yesterday
  const mostRecentDate = uniqueDates[0];
  const daysDiff = Math.floor((todayTime - mostRecentDate) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) return 0; // Streak is broken

  let streak = 0;
  let currentDate = todayTime;

  for (const dateTime of uniqueDates) {
    const diff = Math.floor((currentDate - dateTime) / (1000 * 60 * 60 * 24));
    if (diff === 0 || diff === 1) {
      streak++;
      currentDate = dateTime;
    } else {
      break;
    }
  }

  return streak;
}
