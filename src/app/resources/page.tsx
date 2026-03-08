"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Resource } from '@/types';
import { ResourceCard } from '@/components/resources/resource-card';
import { Button } from '@/components/ui/button';
import { Plus, Bookmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useState } from 'react';

const categories = ['All', 'Article', 'Video', 'Docs', 'Course', 'Other'];

export default function ResourcesPage() {
  const { data: session } = useSession();
  const [filter, setFilter] = useState('All');

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const res = await fetch('/api/resources');
      if (!res.ok) throw new Error('Failed to fetch resources');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const filteredResources = resources?.filter(resource =>
    filter === 'All' || resource.category === filter
  ) || [];

  const isEmpty = !resources || resources.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Save and organize useful links and materials
          </p>
        </div>
        <Link href={session?.user ? "/resources/new" : "/auth/login"}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Bookmark className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No resources yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start bookmarking articles, videos, and courses that help you learn
          </p>
          <Link href={session?.user ? "/resources/new" : "/auth/login"}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Resource
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Resources List */}
          <div className="space-y-4">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No resources found in this category
              </div>
            ) : (
              filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
