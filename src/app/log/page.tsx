"use client";

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { Entry } from '@/types';
import { EntryCard } from '@/components/entries/entry-card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function LogPage() {
  const { data: session } = useSession();
  const { data: entries, isLoading } = useQuery<Entry[]>({
    queryKey: ['entries'],
    queryFn: async () => {
      const res = await fetch('/api/entries');
      if (!res.ok) throw new Error('Failed to fetch entries');
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !entries || entries.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Log</h1>
          <p className="text-muted-foreground">
            Document your daily learnings and insights
          </p>
        </div>
        <Link href={session?.user ? "/log/new" : "/auth/login"}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No entries yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start documenting your learning journey by creating your first log entry
          </p>
          <Link href={session?.user ? "/log/new" : "/auth/login"}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Entry
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
