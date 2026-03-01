import Link from 'next/link';

interface PostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  authorUsername: string;
  createdAt: Date;
  views: number;
  likes: number;
  pinned: boolean;
  tags: Array<{ name: string; color: string }>;
}

export default function PostCard({
  slug,
  title,
  excerpt,
  authorName,
  authorUsername,
  createdAt,
  views,
  likes,
  pinned,
  tags,
}: PostCardProps) {
  return (
    <article className="group rounded-lg border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {pinned && (
            <span className="mb-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
              Pinned
            </span>
          )}
          <Link href={`/posts/${slug}`}>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-700">
              {title}
            </h2>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{excerpt}</p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Link
              key={tag.name}
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

      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
        <Link href={`/u/${authorUsername}`} className="font-medium text-gray-500 hover:text-gray-700">
          {authorName}
        </Link>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
        <span>{views} views</span>
        <span>{likes} likes</span>
      </div>
    </article>
  );
}
