import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createEntrySchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/entries - Get all entries
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const tag = searchParams.get('tag');

    const where: {
      userId: string;
      projectId?: string;
      tags?: { contains: string };
    } = {
      userId: session.user.id,
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const entries = await prisma.entry.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Parse JSON strings to arrays
    const formattedEntries = entries.map((entry: any) => ({
      ...entry,
      tags: parseJSON<string[]>(entry.tags, []),
      project: entry.project ? {
        ...entry.project,
        techStack: parseJSON<string[]>(entry.project.techStack, []),
      } : null,
    }));

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

// POST /api/entries - Create a new entry
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/entries called');
    const session = await auth();
    console.log('Session in API route:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('No session or user ID, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createEntrySchema.parse(body);

    const entry = await prisma.entry.create({
      data: {
        title: validatedData.title,
        body: validatedData.body,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        tags: JSON.stringify(validatedData.tags),
        projectId: validatedData.projectId || null,
        userId: session.user.id,
      },
      include: {
        project: true,
      },
    });

    // Parse JSON strings to arrays
    const formattedEntry = {
      ...entry,
      tags: parseJSON<string[]>(entry.tags, []),
      project: entry.project ? {
        ...entry.project,
        techStack: parseJSON<string[]>(entry.project.techStack, []),
      } : null,
    };

    return NextResponse.json(formattedEntry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
