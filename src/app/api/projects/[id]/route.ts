import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateProjectSchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/projects/[id] - Get a single project
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
    
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
      include: {
        entries: {
          orderBy: { date: 'desc' },
        },
        _count: {
          select: {
            entries: true,
            resources: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings to arrays
    const formattedProject = {
      ...project,
      techStack: parseJSON<string[]>(project.techStack, []),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries: project.entries.map((entry: any) => ({
        ...entry,
        tags: parseJSON<string[]>(entry.tags, []),
      })),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
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
    const validatedData = updateProjectSchema.parse(body);

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const updateData: {
      name?: string;
      description?: string;
      techStack?: string;
      status?: string;
      liveUrl?: string | null;
      repoUrl?: string | null;
    } = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.techStack !== undefined) {
      updateData.techStack = JSON.stringify(validatedData.techStack);
    }
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.liveUrl !== undefined) updateData.liveUrl = validatedData.liveUrl || null;
    if (validatedData.repoUrl !== undefined) updateData.repoUrl = validatedData.repoUrl || null;

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            entries: true,
            resources: true,
          },
        },
      },
    });

    // Parse JSON strings to arrays
    const formattedProject = {
      ...project,
      techStack: parseJSON<string[]>(project.techStack, []),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error('Error updating project:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
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
    
    // Verify ownership
    const project = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
