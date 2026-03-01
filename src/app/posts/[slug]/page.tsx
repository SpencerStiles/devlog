import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, incrementPostView } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import Markdown from '@/components/markdown';
import LikeButton from './like-button';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  // Increment view count as an explicit side-effect, separate from the pure read
  await incrementPostView(params.slug);

  const tags = post.postTags.map((pt) => pt.tag);

  return (
    <article className="space-y-6">
      {/* Header */}
      <div>
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.name}`}
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: tag.color + '15',
                  color: tag.color,
                }}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
          <Link
            href={`/u/${post.author.username}`}
            className="font-medium text-gray-700 hover:text-brand-600"
          >
            {post.author.name}
          </Link>
          <span>{formatDate(post.createdAt)}</span>
          <span>{post.views} views</span>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border bg-white p-6 md:p-8">
        <Markdown content={post.content} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between rounded-lg border bg-white p-4">
        <LikeButton slug={post.slug} initialLikes={post.likes} />
        <div className="text-xs text-gray-400">
          Updated {formatDate(post.updatedAt)}
        </div>
      </div>

      {/* Back */}
      <Link
        href="/"
        className="inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back to feed
      </Link>
    </article>
  );
}
