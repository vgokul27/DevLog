"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { Project } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, ExternalLink, Github, Edit, Trash2, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

const statusConfig = {
  Idea: { color: 'bg-purple-500/10 text-purple-700 border-purple-200', label: 'Idea' },
  Building: { color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Building' },
  Shipped: { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Shipped' },
  Paused: { color: 'bg-gray-500/10 text-gray-700 border-gray-200', label: 'Paused' },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const { data: project, isLoading } = useQuery<Project & { entries: Array<{ id: string; title: string; date: string; tags: string[] }> }>({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete project');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      router.push('/projects');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
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

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const status = statusConfig[project.status as keyof typeof statusConfig];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/projects/${projectId}/edit`}>
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
              <div className="flex items-start gap-4 mb-4">
                <h1 className="text-3xl font-bold flex-1">{project.name}</h1>
                <Badge className={cn(status.color)}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                {project.description}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            {(project.liveUrl || project.repoUrl) && (
              <div className="flex gap-4">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Site
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    Repository
                  </a>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {project.entries && project.entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Linked Entries ({project.entries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {project.entries.map((entry) => (
                <Link key={entry.id} href={`/log/${entry.id}`}>
                  <div className="p-4 rounded-lg border hover:bg-accent transition-colors cursor-pointer">
                    <h3 className="font-semibold mb-1">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(entry.date)}</span>
                      {entry.tags && entry.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {entry.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
