import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAuthor } from '@/lib/actions';
import PostCard from '@/components/post-card';

export const dynamic = 'force-dynamic';

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const username = decodeURIComponent(params.username);
  const author = await getAuthor(username);
  if (!author) notFound();

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
            {author.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{author.name}</h1>
            <p className="text-sm text-gray-500">@{author.username}</p>
            {author.bio && (
              <p className="mt-2 text-sm text-gray-600">{author.bio}</p>
            )}
            <div className="mt-2 flex gap-3 text-xs text-gray-400">
              <span>{author.posts.length} posts</span>
              {author.github && (
                <a
                  href={`https://github.com/${author.github}`}
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {author.website && (
                <a
                  href={author.website}
                  className="text-gray-500 hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="mb-4 font-semibold text-gray-900">Posts</h2>
        {author.posts.length === 0 ? (
          <p className="text-sm text-gray-500">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {author.posts.map((post) => (
              <PostCard
                key={post.id}
                slug={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                authorName={author.name}
                authorUsername={author.username}
                createdAt={post.createdAt}
                views={post.views}
                likes={post.likes}
                pinned={post.pinned}
                tags={post.postTags.map((pt) => ({
                  name: pt.tag.name,
                  color: pt.tag.color,
                }))}
              />
            ))}
          </div>
        )}
      </div>

      <Link href="/" className="inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Back to feed
      </Link>
    </div>
  );
}
