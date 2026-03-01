import Link from 'next/link';
import { listTags } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function TagsPage() {
  const tags = await listTags();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="mt-1 text-sm text-gray-500">Browse posts by topic.</p>
      </div>

      {tags.length === 0 ? (
        <p className="text-sm text-gray-500">No tags yet. Create a post with tags to get started.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.name}`}
              className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 transition-shadow hover:shadow-md"
              style={{ borderColor: tag.color + '40' }}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium text-gray-900">{tag.name}</span>
              <span className="text-xs text-gray-400">
                {tag._count.postTags} posts
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
