"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Entry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Calendar, Edit, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const entryId = params.id as string;

  const { data: entry, isLoading } = useQuery<Entry>({
    queryKey: ['entries', entryId],
    queryFn: async () => {
      const res = await fetch(`/api/entries/${entryId}`);
      if (!res.ok) throw new Error('Failed to fetch entry');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete entry');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });
      router.push('/log');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Entry not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/log">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/log/${entryId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{entry.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(entry.date)}</span>
                </div>
                {entry.project && (
                  <Link href={`/projects/${entry.projectId}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      {entry.project.name}
                    </Badge>
                  </Link>
                )}
              </div>
            </div>

            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{entry.body}</ReactMarkdown>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
