"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import type { CommunityPost } from "../lib/community";

function getDisplayName(user: User) {
  return String(user.user_metadata?.full_name || user.user_metadata?.first_name || "HSK学习者").trim().slice(0, 40);
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
      setError("请先写下你的想法或问题。");
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
      setError("发布失败，请稍后再试。");
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
        <span>参与讨论</span>
        <h2>你怎样理解这道题？</h2>
        <p>可以讨论主线、信息取舍和表达方法。不要只复制参考答案。</p>
        <textarea
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setError("");
          }}
          maxLength={280}
          placeholder="例如：我觉得地点在这里可以删掉，因为它不影响事件结果。"
        />
        <div className="discussion-compose-foot">
          <small>{content.length} / 280</small>
          <button type="submit" disabled={submitting}>{submitting ? "发布中…" : "发表想法"}</button>
        </div>
        {error && <p className="community-compose-error" role="alert">{error}</p>}
      </form>

      <section className="discussion-posts">
        <div className="discussion-section-head">
          <span>这道题的讨论</span>
          <small>{posts.length} 条</small>
        </div>
        {posts.length ? posts.map((post) => (
          <article className="discussion-post" key={post.id}>
            <div>
              <strong>{post.is_anonymous ? "匿名学习者" : post.display_name}</strong>
              <time>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date(post.created_at))}</time>
            </div>
            <p>{post.content}</p>
          </article>
        )) : (
          <div className="discussion-empty">
            <span>第一个位置留给你</span>
            <h3>还没有人讨论这道题</h3>
            <p>写下你的判断或疑问，之后来到这里的学习者就能接着讨论。</p>
          </div>
        )}
      </section>
    </div>
  );
}
