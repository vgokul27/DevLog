"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Entry } from '@/types';
import { formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, Tag } from 'lucide-react';

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const preview = truncate(
    entry.body.replace(/[#*`\n]/g, ''),
    150
  );

  return (
    <Link href={`/log/${entry.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-lg line-clamp-2">
                {entry.title}
              </h3>
              {entry.project && (
                <Badge variant="secondary" className="shrink-0">
                  {entry.project.name}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {preview}
            </p>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(entry.date)}</span>
                </div>
              </div>

              {entry.tags && entry.tags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {entry.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {entry.tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{entry.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
