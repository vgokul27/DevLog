"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [techInput, setTechInput] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      techStack: [],
      status: 'Idea',
    },
  });

  const techStack = watch('techStack') || [];

  const createMutation = useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: 'Success',
        description: 'Project created successfully',
      });
      router.push('/projects');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateProjectInput) => {
    createMutation.mutate(data);
  };

  const addTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setValue('techStack', [...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const removeTech = (techToRemove: string) => {
    setValue('techStack', techStack.filter(tech => tech !== techToRemove));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Project</h1>
          <p className="text-muted-foreground">Add a new project to track</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="What is this project about?"
                className="min-h-[100px]"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack *</Label>
              <div className="flex gap-2">
                <Input
                  id="techStack"
                  placeholder="Add a technology..."
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTech();
                    }
                  }}
                />
                <Button type="button" onClick={addTech} variant="secondary">
                  Add
                </Button>
              </div>
              {errors.techStack && (
                <p className="text-sm text-destructive">{errors.techStack.message}</p>
              )}
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('status')}
              >
                <option value="Idea">Idea</option>
                <option value="Building">Building</option>
                <option value="Shipped">Shipped</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="liveUrl">Live URL (optional)</Label>
                <Input
                  id="liveUrl"
                  type="url"
                  placeholder="https://example.com"
                  {...register('liveUrl')}
                />
                {errors.liveUrl && (
                  <p className="text-sm text-destructive">{errors.liveUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL (optional)</Label>
                <Input
                  id="repoUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  {...register('repoUrl')}
                />
                {errors.repoUrl && (
                  <p className="text-sm text-destructive">{errors.repoUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
