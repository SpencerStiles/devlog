'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, getOrCreateAuthor } from '@/lib/actions';
import Markdown from '@/components/markdown';

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorUsername, setAuthorUsername] = useState('');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName.trim() || !authorUsername.trim()) return;
    setSaving(true);

    try {
      const author = await getOrCreateAuthor({
        name: authorName,
        username: authorUsername.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      });

      const post = await createPost({
        title,
        content,
        authorId: author.id,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        published: true,
      });

      router.push(`/posts/${post.slug}`);
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Write a Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share a TIL, code snippet, or dev note. Markdown supported.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Jane Doe"
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={authorUsername}
              onChange={(e) => setAuthorUsername(e.target.value)}
              placeholder="janedoe"
              className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="TIL: How to use Promise.allSettled()"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <button
              type="button"
              onClick={() => setPreview(!preview)}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
          {preview ? (
            <div className="mt-1 min-h-[200px] rounded-lg border bg-white p-4">
              <Markdown content={content} />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post in markdown..."
              rows={12}
              className="mt-1 block w-full rounded-lg border px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              required
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="javascript, til, react"
            className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated</p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving || !title.trim() || !content.trim()}
            className="rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
