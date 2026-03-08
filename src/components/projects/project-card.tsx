"use client";

import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import Link from 'next/link';
import { ExternalLink, Github, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  Idea: { color: 'bg-purple-500/10 text-purple-700 border-purple-200', label: 'Idea' },
  Building: { color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Building' },
  Shipped: { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Shipped' },
  Paused: { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Paused' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status as keyof typeof statusConfig];

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50 cursor-pointer flex flex-col">
        <CardContent className="p-6 flex-1">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-2">
                {project.name}
              </h3>
              <Badge className={cn("shrink-0", status.color)}>
                {status.label}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-1">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs rounded-md bg-secondary"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="px-2 py-1 text-xs text-muted-foreground">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{project._count?.entries || 0} entries</span>
            </div>
            <div className="flex gap-2">
              {project.repoUrl && (
                <Github className="h-4 w-4" />
              )}
              {project.liveUrl && (
                <ExternalLink className="h-4 w-4" />
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
