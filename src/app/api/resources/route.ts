import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createResourceSchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/resources - Get all resources
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isFavorite = searchParams.get('isFavorite');
    const isRead = searchParams.get('isRead');

    const where: {
      userId: string;
      category?: string;
      isFavorite?: boolean;
      isRead?: boolean;
    } = {
      userId: session.user.id,
    };

    if (category) where.category = category;
    if (isFavorite !== null) where.isFavorite = isFavorite === 'true';
    if (isRead !== null) where.isRead = isRead === 'true';

    const resources = await prisma.resource.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Parse JSON strings to arrays
    const formattedResources = resources.map((resource: any) => ({
      ...resource,
      tags: parseJSON<string[]>(resource.tags, []),
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST /api/resources - Create a new resource
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createResourceSchema.parse(body);

    // Create the resource
    const resource = await prisma.resource.create({
      data: {
        title: validatedData.title,
        url: validatedData.url,
        category: validatedData.category,
        notes: validatedData.notes || null,
        isFavorite: validatedData.isFavorite,
        isRead: validatedData.isRead,
        tags: JSON.stringify(validatedData.tags),
        userId: session.user.id,
      },
    });

    // Link to entry if provided
    if (validatedData.entryId) {
      await prisma.entryResource.create({
        data: {
          entryId: validatedData.entryId,
          resourceId: resource.id,
        },
      });
    }

    // Link to project if provided
    if (validatedData.projectId) {
      await prisma.projectResource.create({
        data: {
          projectId: validatedData.projectId,
          resourceId: resource.id,
        },
      });
    }

    // Parse JSON strings to arrays
    const formattedResource = {
      ...resource,
      tags: parseJSON<string[]>(resource.tags, []),
    };

    return NextResponse.json(formattedResource, { status: 201 });
  } catch (error) {
    console.error('Error creating resource:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}
