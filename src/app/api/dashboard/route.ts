import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseJSON, calculateStreak } from '@/lib/utils';
import { startOfWeek, subWeeks, format } from 'date-fns';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get total counts
    const [totalEntries, totalProjects, totalResources] = await Promise.all([
      prisma.entry.count({ where: { userId } }),
      prisma.project.count({ where: { userId } }),
      prisma.resource.count({ where: { userId } }),
    ]);

    // Get all entries for streak calculation
    const allEntries = await prisma.entry.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentStreak = calculateStreak(allEntries.map((e: any) => e.date));

    // Get activity data for last 8 weeks
    const eightWeeksAgo = subWeeks(new Date(), 7);
    const entriesForActivity = await prisma.entry.findMany({
      where: {
        userId,
        date: {
          gte: eightWeeksAgo,
        },
      },
      select: { date: true },
    });

    // Group entries by week
    const activityMap = new Map<string, number>();
    for (let i = 0; i < 8; i++) {
      const weekStart = subWeeks(new Date(), 7 - i);
      const weekLabel = format(startOfWeek(weekStart), 'MMM dd');
      activityMap.set(weekLabel, 0);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entriesForActivity.forEach((entry: any) => {
      const weekLabel = format(startOfWeek(new Date(entry.date)), 'MMM dd');
      const count = activityMap.get(weekLabel) || 0;
      activityMap.set(weekLabel, count + 1);
    });

    const activityData = Array.from(activityMap.entries()).map(([week, entries]) => ({
      week,
      entries,
    }));

    // Get top 5 tags
    const allEntriesWithTags = await prisma.entry.findMany({
      where: { userId },
      select: { tags: true },
    });

    const tagCounts = new Map<string, number>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allEntriesWithTags.forEach((entry: any) => {
      const tags = parseJSON<string[]>(entry.tags, []);
      tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalEntries,
      totalProjects,
      totalResources,
      currentStreak,
      activityData,
      topTags,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
