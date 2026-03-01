import Link from 'next/link';
import { listPosts } from '@/lib/actions';
import PostCard from '@/components/post-card';

export const dynamic = 'force-dynamic';

interface Props {
  params: { name: string };
}

export default async function TagPage({ params }: Props) {
  const tagName = decodeURIComponent(params.name);
  const { posts, total } = await listPosts({ tag: tagName, limit: 50 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tags" className="text-sm text-gray-500 hover:text-gray-700">
          ← Tags
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">#{tagName}</h1>
        <span className="text-sm text-gray-400">{total} posts</span>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts with this tag yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              slug={post.slug}
              title={post.title}
              excerpt={post.excerpt}
              authorName={post.author.name}
              authorUsername={post.author.username}
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
  );
}
