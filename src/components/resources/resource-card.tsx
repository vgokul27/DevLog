"use client";

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resource } from '@/types';
import { ExternalLink, Star, Check, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
  resource: Resource;
}

const categoryColors = {
  Article: 'bg-blue-500/10 text-blue-700 border-blue-200',
  Video: 'bg-red-500/10 text-red-700 border-red-200',
  Docs: 'bg-green-500/10 text-green-700 border-green-200',
  Course: 'bg-purple-500/10 text-purple-700 border-purple-200',
  Other: 'bg-gray-500/10 text-gray-700 border-gray-200',
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !resource.isFavorite }),
      });
      if (!res.ok) throw new Error('Failed to update resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !resource.isRead }),
      });
      if (!res.ok) throw new Error('Failed to update resource');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete resource');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast({
        title: 'Success',
        description: 'Resource deleted successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    },
  });

  const categoryColor = categoryColors[resource.category as keyof typeof categoryColors];

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                    {resource.title}
                  </h3>
                  <Badge className={cn("shrink-0", categoryColor)}>
                    {resource.category}
                  </Badge>
                </div>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  {resource.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            {resource.notes && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {resource.notes}
              </p>
            )}

            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded-md bg-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button
              variant={resource.isFavorite ? 'default' : 'outline'}
              size="icon"
              onClick={() => toggleFavoriteMutation.mutate()}
              disabled={toggleFavoriteMutation.isPending}
            >
              <Star className={cn("h-4 w-4", resource.isFavorite && "fill-current")} />
            </Button>
            <Button
              variant={resource.isRead ? 'default' : 'outline'}
              size="icon"
              onClick={() => toggleReadMutation.mutate()}
              disabled={toggleReadMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
