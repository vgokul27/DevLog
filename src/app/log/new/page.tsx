"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEntrySchema, type CreateEntryInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/types';

export default function NewEntryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateEntryInput>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      tags: [],
      date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm for datetime-local
    },
  });

  const tags = watch('tags') || [];

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateEntryInput) => {
      console.log('Sending request to API with:', data);
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin', // Explicitly include cookies
        body: JSON.stringify(data),
      });
      console.log('API Response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('API Error:', errorData);
        throw new Error(errorData.error || 'Failed to create entry');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      toast({
        title: 'Success',
        description: 'Entry created successfully',
      });
      router.push('/log');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create entry',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateEntryInput) => {
    console.log('Form submitted with data:', data);
    // Transform empty string to null for projectId
    const submissionData = {
      ...data,
      projectId: data.projectId || null,
    };
    console.log('Transformed data:', submissionData);
    createMutation.mutate(submissionData);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/log">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Learning Entry</h1>
          <p className="text-muted-foreground">Document what you learned today</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="What did you learn?"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Notes *</Label>
              <Textarea
                id="body"
                placeholder="Document your learnings... (Markdown supported)"
                className="min-h-[300px] font-mono"
                {...register('body')}
              />
              {errors.body && (
                <p className="text-sm text-destructive">{errors.body.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                {...register('date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Link to Project (optional)</Label>
              <select
                id="projectId"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register('projectId')}
              >
                <option value="">No project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} variant="secondary">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm font-medium text-destructive mb-2">Please fix the following errors:</p>
                <ul className="list-disc list-inside text-sm text-destructive space-y-1">
                  {errors.title && <li>Title: {errors.title.message}</li>}
                  {errors.body && <li>Body: {errors.body.message}</li>}
                  {errors.date && <li>Date: {errors.date.message}</li>}
                  {errors.tags && <li>Tags: {errors.tags.message}</li>}
                </ul>
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/log">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
