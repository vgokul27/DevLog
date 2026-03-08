import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateResourceSchema } from '@/lib/validations';
import { parseJSON } from '@/lib/utils';
import { auth } from '@/lib/auth';

// GET /api/resources/[id] - Get a single resource
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
    
    const resource = await prisma.resource.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    // Parse JSON strings to arrays
    const formattedResource = {
      ...resource,
      tags: parseJSON<string[]>(resource.tags, []),
    };

    return NextResponse.json(formattedResource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource' },
      { status: 500 }
    );
  }
}

// PUT /api/resources/[id] - Update a resource
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
    const validatedData = updateResourceSchema.parse(body);

    // Verify ownership
    const existingResource = await prisma.resource.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const updateData: {
      title?: string;
      url?: string;
      category?: string;
      notes?: string | null;
      isFavorite?: boolean;
      isRead?: boolean;
      tags?: string;
    } = {};

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.url !== undefined) updateData.url = validatedData.url;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.isFavorite !== undefined) {
      updateData.isFavorite = validatedData.isFavorite;
    }
    if (validatedData.isRead !== undefined) updateData.isRead = validatedData.isRead;
    if (validatedData.tags !== undefined) {
      updateData.tags = JSON.stringify(validatedData.tags);
    }

    const resource = await prisma.resource.update({
      where: { id },
      data: updateData,
    });

    // Parse JSON strings to arrays
    const formattedResource = {
      ...resource,
      tags: parseJSON<string[]>(resource.tags, []),
    };

    return NextResponse.json(formattedResource);
  } catch (error) {
    console.error('Error updating resource:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE /api/resources/[id] - Delete a resource
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
    const resource = await prisma.resource.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!resource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    await prisma.resource.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
