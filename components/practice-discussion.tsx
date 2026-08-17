"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import type { CommunityPost } from "../lib/community";

function getDisplayName(user: User) {
  return String(user.user_metadata?.full_name || user.user_metadata?.first_name || "HSK Learner").trim().slice(0, 40);
}

export default function PracticeDiscussion({
  practiceItemId,
  posts,
}: {
  practiceItemId: string;
  posts: CommunityPost[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const draft = window.sessionStorage.getItem(`discussion-draft-${practiceItemId}`);
    if (draft) setContent(draft);
  }, [practiceItemId]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanContent = content.trim();
    if (cleanContent.length < 2) {
      setError("Please write your idea or question first.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.sessionStorage.setItem(`discussion-draft-${practiceItemId}`, cleanContent);
      window.location.href = `/?auth=login&next=${encodeURIComponent(`/community/practice/${practiceItemId}`)}`;
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("community_posts").insert({
      user_id: user.id,
      post_type: "practice_discussion",
      practice_item_id: practiceItemId,
      category: "question",
      content: cleanContent,
      display_name: getDisplayName(user),
      is_anonymous: false,
    });
    if (insertError) {
      setError("Your post could not be published. Please try again later.");
      setSubmitting(false);
      return;
    }
    window.sessionStorage.removeItem(`discussion-draft-${practiceItemId}`);
    setContent("");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <div className="discussion-layout">
      <form className="discussion-compose" onSubmit={publish}>
          <span>Join the Discussion</span>
          <h2>How Would You Approach This Exercise?</h2>
          <p>Discuss the main thread, information selection, or wording. Please do not simply copy the suggested answer.</p>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setError("");
          }}
          maxLength={280}
          placeholder="For example: I would remove the location because it does not affect the outcome."
        />
        <div className="discussion-compose-foot">
          <small>{content.length} / 280</small>
        <button type="submit" disabled={submitting}>{submitting ? "Publishing…" : "Post Idea"}</button>
        </div>
        {error && <p className="community-compose-error" role="alert">{error}</p>}
      </form>

      <section className="discussion-posts">
        <div className="discussion-section-head">
          <span>Discussion</span>
          <small>{posts.length} posts</small>
        </div>
        {posts.length ? posts.map((post) => (
          <article className="discussion-post" key={post.id}>
            <div>
                  <strong>{post.is_anonymous ? "Anonymous Learner" : post.display_name}</strong>
              <time>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(post.created_at))}</time>
            </div>
            <p>{post.content}</p>
          </article>
        )) : (
          <div className="discussion-empty">
            <span>Be the First</span>
            <h3>No One Has Discussed This Exercise Yet</h3>
            <p>Share your reasoning or question so the next learner can continue the conversation.</p>
          </div>
        )}
      </section>
    </div>
  );
}
