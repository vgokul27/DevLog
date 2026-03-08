import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createProjectSchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: { userId: string; status?: string } = {
      userId: session.user.id,
    };
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            entries: true,
            resources: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Parse JSON strings to arrays
    const formattedProjects = projects.map((project: any) => ({
      ...project,
      techStack: parseJSON<string[]>(project.techStack, []),
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        techStack: JSON.stringify(validatedData.techStack),
        status: validatedData.status,
        liveUrl: validatedData.liveUrl || null,
        repoUrl: validatedData.repoUrl || null,
        userId: session.user.id,
      },
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

    return NextResponse.json(formattedProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
