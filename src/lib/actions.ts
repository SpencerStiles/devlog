'use server';

import { prisma } from './db';
import { uniqueSlug } from './slugify';
import { revalidatePath } from 'next/cache';
import { logger } from './logger';

// ──────────────────────────────────────────────
// Posts
// ──────────────────────────────────────────────

export async function createPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  published?: boolean;
  pinned?: boolean;
  authorId: string;
  tags?: string[];
}) {
  try {
    const slug = uniqueSlug(data.title);

    const post = await prisma.post.create({
      data: {
        slug,
        title: data.title,
        content: data.content,
        excerpt: data.excerpt ?? data.content.slice(0, 160),
        published: data.published ?? true,
        pinned: data.pinned ?? false,
        authorId: data.authorId,
      },
    });

    if (data.tags && data.tags.length > 0) {
      await syncTags(post.id, data.tags);
    }

    revalidatePath('/');
    revalidatePath(`/posts/${slug}`);
    return post;
  } catch (err) {
    logger.error('Failed in createPost', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    published?: boolean;
    pinned?: boolean;
    tags?: string[];
  },
) {
  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt,
        published: data.published,
        pinned: data.pinned,
      },
    });

    if (data.tags !== undefined) {
      await syncTags(post.id, data.tags);
    }

    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);
    return post;
  } catch (err) {
    logger.error('Failed in updatePost', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function deletePost(id: string) {
  try {
    const post = await prisma.post.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath(`/posts/${post.slug}`);
  } catch (err) {
    logger.error('Failed in deletePost', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function getPost(slug: string) {
  try {
    return prisma.post.findUnique({
      where: { slug },
      include: {
        author: true,
        postTags: { include: { tag: true } },
      },
    });
  } catch (err) {
    logger.error('Failed in getPost', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function incrementPostView(slug: string) {
  try {
    await prisma.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
  } catch (err) {
    logger.error('Failed in incrementPostView', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function likePost(slug: string, token: string) {
  // Attempt to record the like for this browser token.
  // If the unique constraint fires, the user already liked this post.
  try {
    const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) return { success: false, alreadyLiked: false };

    await prisma.postLike.create({
      data: { postId: post.id, token },
    });

    // PostLike was created — safe to increment
    await prisma.post.update({
      where: { slug },
      data: { likes: { increment: 1 } },
    });

    revalidatePath(`/posts/${slug}`);
    return { success: true, alreadyLiked: false };
  } catch (err: unknown) {
    // Unique constraint violation means this token already liked the post
    const isUniqueConstraint =
      err instanceof Error && err.message.includes('Unique constraint');
    if (isUniqueConstraint) {
      return { success: false, alreadyLiked: true };
    }
    logger.error('Failed in likePost', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw err;
  }
}

export async function listPosts(options?: {
  tag?: string;
  authorId?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const where: {
      published: boolean;
      postTags?: { some: { tag: { name: string } } };
      authorId?: string;
    } = { published: true };

    if (options?.tag) {
      where.postTags = { some: { tag: { name: options.tag } } };
    }
    if (options?.authorId) {
      where.authorId = options.authorId;
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
        include: {
          author: true,
          postTags: { include: { tag: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return { posts, total };
  } catch (err) {
    logger.error('Failed in listPosts', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Tags
// ──────────────────────────────────────────────

async function syncTags(postId: string, tagNames: string[]) {
  // Remove existing tags
  await prisma.postTag.deleteMany({ where: { postId } });

  const names = tagNames.map((n) => n.trim().toLowerCase()).filter(Boolean);
  if (names.length === 0) return;

  // Upsert tags one-by-one (SQLite does not support skipDuplicates in createMany)
  const tags = await Promise.all(
    names.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  // Insert join table rows one-by-one (SQLite does not support skipDuplicates)
  await Promise.all(
    tags.map((tag) =>
      prisma.postTag.upsert({
        where: { postId_tagId: { postId, tagId: tag.id } },
        update: {},
        create: { postId, tagId: tag.id },
      }),
    ),
  );
}

export async function listTags() {
  try {
    return prisma.tag.findMany({
      include: { _count: { select: { postTags: true } } },
      orderBy: { name: 'asc' },
    });
  } catch (err) {
    logger.error('Failed in listTags', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Authors
// ──────────────────────────────────────────────

export async function getOrCreateAuthor(data: {
  name: string;
  username: string;
  bio?: string;
  github?: string;
}) {
  try {
    return prisma.author.upsert({
      where: { username: data.username },
      update: { name: data.name, bio: data.bio ?? '', github: data.github ?? '' },
      create: {
        name: data.name,
        username: data.username,
        bio: data.bio ?? '',
        github: data.github ?? '',
      },
    });
  } catch (err) {
    logger.error('Failed in getOrCreateAuthor', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

export async function getAuthor(username: string) {
  try {
    return prisma.author.findUnique({
      where: { username },
      include: {
        posts: {
          where: { published: true },
          orderBy: { createdAt: 'desc' },
          include: { postTags: { include: { tag: true } } },
        },
      },
    });
  } catch (err) {
    logger.error('Failed in getAuthor', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}

// ──────────────────────────────────────────────
// Stats
// ──────────────────────────────────────────────

export async function getStats() {
  try {
    const [postCount, tagCount, totalViews, totalLikes] = await Promise.all([
      prisma.post.count({ where: { published: true } }),
      prisma.tag.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.post.aggregate({ _sum: { likes: true } }),
    ]);

    return {
      postCount,
      tagCount,
      totalViews: totalViews._sum.views ?? 0,
      totalLikes: totalLikes._sum.likes ?? 0,
    };
  } catch (err) {
    logger.error('Failed in getStats', { error: err instanceof Error ? err.message : 'Unknown error' });
    throw new Error(err instanceof Error ? err.message : 'Operation failed');
  }
}
