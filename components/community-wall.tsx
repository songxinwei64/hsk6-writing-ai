"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { communityCategoryLabels, type CommunityPost } from "../lib/community";

const draftKey = "write-hsk-community-wall-draft";

type WallItem = {
  id: string;
  content: string;
  author: string;
  official: boolean;
};

type MosaicPiece = WallItem & {
  x: number;
  y: number;
  fragment: string;
};

function getDisplayName(user: User) {
  const name = user.user_metadata?.full_name || user.user_metadata?.first_name;
  return String(name || "HSK学习者").trim().slice(0, 40);
}

function getFragment(content: string, index: number) {
  const clean = content.replace(/[\s，。！？、,.!?]/g, "");
  if (clean.length <= 4) return clean;
  const length = 2 + (index % 3);
  const start = (index * 3) % Math.max(1, clean.length - length + 1);
  return clean.slice(start, start + length);
}

function TextMosaic({ items }: { items: WallItem[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<MosaicPiece[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    function buildMosaic() {
      if (!stage) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#000";
      context.textAlign = "center";
      context.textBaseline = "middle";
      const fontSize = Math.min(height * 0.8, width * 0.42);
      context.font = `900 ${fontSize}px "Microsoft YaHei", "Noto Sans SC", sans-serif`;
      context.fillText("加油", width / 2, height / 2 + fontSize * 0.02);

      const pixels = context.getImageData(0, 0, width, height).data;
      const stepX = width < 700 ? 18 : 22;
      const stepY = width < 700 ? 14 : 16;
      const nextPieces: MosaicPiece[] = [];

      for (let y = stepY; y < height - stepY; y += stepY) {
        for (let x = stepX; x < width - stepX; x += stepX) {
          if (pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] < 100) continue;
          const item = items[nextPieces.length % items.length];
          nextPieces.push({
            ...item,
            x: (x / width) * 100,
            y: (y / height) * 100,
            fragment: getFragment(item.content, nextPieces.length),
          });
        }
      }
      setPieces(nextPieces);
    }

    buildMosaic();
    const observer = new ResizeObserver(buildMosaic);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="word-mosaic" ref={stageRef} aria-label="由学习短句组成的加油两个字">
      {pieces.map((piece, index) => (
        <span
          className={piece.official ? "official" : ""}
          style={{ left: `${piece.x}%`, top: `${piece.y}%` }}
          title={`${piece.author}：${piece.content}`}
          key={`${piece.id}-${index}`}
        >{piece.fragment}</span>
      ))}
      {!pieces.length && <strong className="word-mosaic-loading">加油</strong>}
    </div>
  );
}

export default function CommunityWall({
  posts,
  officialPrompts,
}: {
  posts: CommunityPost[];
  officialPrompts: readonly string[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<keyof typeof communityCategoryLabels>("encouragement");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const savedDraft = window.localStorage.getItem(draftKey);
    if (savedDraft) setContent(savedDraft);
  }, [supabase]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanContent = content.trim();
    if (cleanContent.length < 2) {
      setError("请至少写两个字。");
      return;
    }
    if (cleanContent.length > 20) {
      setError("为了组成清晰的汉字，请控制在20个字以内。");
      return;
    }
    if (!user) {
      window.localStorage.setItem(draftKey, cleanContent);
      window.location.href = "/?auth=login&next=/community/wall";
      return;
    }

    setSubmitting(true);
    setError("");
    const { error: insertError } = await supabase.from("community_posts").insert({
      user_id: user.id,
      post_type: "wall",
      category,
      content: cleanContent,
      display_name: getDisplayName(user),
      is_anonymous: anonymous,
    });
    if (insertError) {
      setError("发布失败，请稍后再试。");
      setSubmitting(false);
      return;
    }

    window.localStorage.removeItem(draftKey);
    setContent("");
    setSubmitting(false);
    router.refresh();
  }

  const wallItems: WallItem[] = posts.length
    ? posts.map((post) => ({
        id: post.id,
        content: post.content,
        author: post.is_anonymous ? "匿名学习者" : post.display_name,
        official: false,
      }))
    : officialPrompts.map((content, index) => ({
        id: `official-${index}`,
        content,
        author: "Write HSK 学习提示",
        official: true,
      }));

  return (
    <div className="wall-experience">
      <section className="wall-canvas-panel">
        <div className="wall-canvas-heading">
          <div>
            <span className="eyebrow">本周共同写成</span>
            <h1>加油</h1>
          </div>
          <p>{posts.length ? `${posts.length} 句话正在组成这两个字。` : "当前使用官方学习提示构成字形，等待第一条真实留言。"}</p>
        </div>
        <TextMosaic items={wallItems} />
        <p className="wall-hover-tip">把鼠标放在文字上，可以看到完整短句和发布者。</p>
      </section>

      <aside className="wall-sidebar">
        <div className="wall-compose-copy">
          <span>写一句鼓励的话</span>
          <h2>让你的文字，成为“加油”的一部分。</h2>
          <p>最多20个字。发布后，你的短句会进入左侧汉字。</p>
        </div>
        <form className="wall-inline-form" onSubmit={publish}>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError("");
            }}
            maxLength={20}
            placeholder="例如：慢一点也没关系，继续走。"
          />
          <div className="wall-form-meta"><span>{content.length} / 20</span></div>
          <div className="community-categories">
            {(Object.keys(communityCategoryLabels) as Array<keyof typeof communityCategoryLabels>).map((key) => (
              <button type="button" className={category === key ? "selected" : ""} onClick={() => setCategory(key)} key={key}>
                {communityCategoryLabels[key]}
              </button>
            ))}
          </div>
          <label className="community-anonymous">
            <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />匿名显示
          </label>
          {error && <p className="community-compose-error" role="alert">{error}</p>}
          <button className="wall-publish-button" type="submit" disabled={submitting}>
            {submitting ? "正在发布…" : user ? "加入文字墙" : "登录并发布"}
          </button>
        </form>

        <div className="wall-recent">
          <div><strong>最近的短句</strong><span>{posts.length ? "真实留言" : "官方示例"}</span></div>
          <ul>
            {wallItems.slice(0, 9).map((item) => (
              <li key={item.id}><span>{item.content}</span><small>{item.author}</small></li>
            ))}
          </ul>
        </div>
      </aside>

      <section className="wall-next-themes">
        <div><span>下一期写什么？</span><p>主题投票功能将在社区有更多用户后开放。</p></div>
        {[
          ["坚持", "练习不会辜负每一次认真"],
          ["进步", "看见自己一点一点向前"],
          ["勇气", "不怕写错，才会写得更好"],
          ["成功", "为完成HSK目标共同努力"],
        ].map(([word, description]) => (
          <article key={word}><strong>{word}</strong><span>{description}</span><small>候选主题</small></article>
        ))}
      </section>
    </div>
  );
}
