import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateEntrySchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/entries/[id] - Get a single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    const entry = await prisma.entry.findFirst({
      where: { 
        id,
        userId: session.user.id,
      },
      include: {
        project: true,
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings to arrays
    const formattedEntry = {
      ...entry,
      tags: parseJSON<string[]>(entry.tags, []),
      project: entry.project ? {
        ...entry.project,
        techStack: parseJSON<string[]>(entry.project.techStack, []),
      } : null,
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    );
  }
}

// PUT /api/entries/[id] - Update an entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateEntrySchema.parse(body);

    // Verify ownership
    const existingEntry = await prisma.entry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    const updateData: {
      title?: string;
      body?: string;
      date?: Date;
      tags?: string;
      projectId?: string | null;
    } = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.body !== undefined) updateData.body = validatedData.body;
    if (validatedData.date !== undefined) {
      updateData.date = new Date(validatedData.date);
    }
    if (validatedData.tags !== undefined) {
      updateData.tags = JSON.stringify(validatedData.tags);
    }
    if (validatedData.projectId !== undefined) {
      updateData.projectId = validatedData.projectId;
    }

    const entry = await prisma.entry.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/entries/[id] - Delete an entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership before deleting
    const entry = await prisma.entry.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    await prisma.entry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
