import { listPosts } from '@/lib/actions';
import PostCard from '@/components/post-card';

export const dynamic = 'force-dynamic';

export default async function FeedPage() {
  const { posts, total } = await listPosts({ limit: 30 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feed</h1>
        <p className="mt-1 text-sm text-gray-500">
          {total} posts — TILs, snippets, and dev notes
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-700">No posts yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Be the first to share something you learned today.
          </p>
          <a
            href="/new"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Write Your First Post
          </a>
        </div>
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
