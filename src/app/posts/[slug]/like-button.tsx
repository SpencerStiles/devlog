'use client';

import { useState } from 'react';
import { likePost } from '@/lib/actions';

interface Props {
  slug: string;
  initialLikes: number;
}

/** Returns a stable random UUID stored in localStorage, creating one if absent. */
function getBrowserToken(): string {
  const key = 'devlog_like_token';
  let token = localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(key, token);
  }
  return token;
}

export default function LikeButton({ slug, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    if (liked) return;

    const token = getBrowserToken();
    const result = await likePost(slug, token);

    if (result.alreadyLiked) {
      // Already liked from this browser — reflect that in the UI
      setLiked(true);
      return;
    }

    if (result.success) {
      setLiked(true);
      setLikes((prev) => prev + 1);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
        liked
          ? 'border-red-200 bg-red-50 text-red-500'
          : 'border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500'
      }`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{likes}</span>
    </button>
  );
}
