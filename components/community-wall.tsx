"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { communityCategoryLabels, type CommunityPost } from "../lib/community";

const draftKey = "write-hsk-community-wall-draft";
const voteThreshold = 5;

export type CommunityWallTheme = {
  id: string;
  round_no: number;
  word: string;
  description: string;
  status: "active" | "candidate" | "archived";
  vote_count: number;
  ends_at: string | null;
  created_at: string;
};

type WallItem = { id: string; content: string; author: string; official: boolean };
type MosaicPiece = WallItem & { x: number; y: number; fragment: string };

function getDisplayName(user: User) {
  const name = user.user_metadata?.full_name || user.user_metadata?.first_name;
  return String(name || "HSK Learner").trim().slice(0, 40);
}

function getFragment(content: string, index: number) {
  const clean = content.replace(/[\s，。！？、,.!?]/g, "");
  if (clean.length <= 4) return clean;
  const length = 2 + (index % 3);
  const start = (index * 3) % Math.max(1, clean.length - length + 1);
  return clean.slice(start, start + length);
}

function TextMosaic({ items, word }: { items: WallItem[]; word: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [pieces, setPieces] = useState<MosaicPiece[]>([]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !items.length) return;

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
      const fontSize = Math.min(height * 0.75, width / Math.max(2.5, word.length * 1.15));
      context.font = `900 ${fontSize}px "Microsoft YaHei", "Noto Sans SC", sans-serif`;
      context.fillText(word, width / 2, height / 2 + fontSize * 0.02);

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

    setPieces([]);
    buildMosaic();
    const observer = new ResizeObserver(buildMosaic);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [items, word]);

  return (
    <div className="word-mosaic" ref={stageRef} aria-label={`The Chinese characters “${word}” formed by community messages`}>
      {pieces.map((piece, index) => (
        <span
          className={piece.official ? "official" : ""}
          style={{ left: `${piece.x}%`, top: `${piece.y}%`, animationDelay: `${Math.min(index * 4, 700)}ms` }}
          title={`${piece.author}：${piece.content}`}
          key={`${word}-${piece.id}-${index}`}
        >
          {piece.fragment}
        </span>
      ))}
      {!pieces.length && <strong className="word-mosaic-loading">{word}</strong>}
    </div>
  );
}

export default function CommunityWall({
  posts,
  themes,
  officialPrompts,
}: {
  posts: CommunityPost[];
  themes: CommunityWallTheme[];
  officialPrompts: readonly string[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [livePosts, setLivePosts] = useState(posts);
  const [liveThemes, setLiveThemes] = useState(themes);
  const [myVoteThemeId, setMyVoteThemeId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<keyof typeof communityCategoryLabels>("encouragement");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [votingThemeId, setVotingThemeId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [voteError, setVoteError] = useState("");

  const reloadPosts = useCallback(async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("id,user_id,post_type,practice_item_id,category,content,display_name,is_anonymous,created_at")
      .eq("post_type", "wall")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(60);
    if (data) setLivePosts(data as CommunityPost[]);
  }, [supabase]);

  const reloadThemes = useCallback(async () => {
    const { data } = await supabase
      .from("community_wall_themes")
      .select("id,round_no,word,description,status,vote_count,ends_at,created_at")
      .in("status", ["active", "candidate"])
      .order("created_at", { ascending: true });
    if (data) setLiveThemes(data as CommunityWallTheme[]);
  }, [supabase]);

  const reloadMyVote = useCallback(async (currentUser: User | null, roundNo: number) => {
    if (!currentUser || !roundNo) {
      setMyVoteThemeId(null);
      return;
    }
    const { data } = await supabase
      .from("community_wall_votes")
      .select("theme_id")
      .eq("user_id", currentUser.id)
      .eq("round_no", roundNo)
      .maybeSingle();
    setMyVoteThemeId(data?.theme_id ?? null);
  }, [supabase]);

  const activeTheme = liveThemes.find((theme) => theme.status === "active");
  const candidates = liveThemes.filter((theme) => theme.status === "candidate");
  const currentRound = candidates[0]?.round_no ?? activeTheme?.round_no ?? 0;
  const leadingCandidate = [...candidates].sort((a, b) => b.vote_count - a.vote_count)[0];
  const votingExpired = leadingCandidate
    ? Date.now() >= new Date(leadingCandidate.ends_at ?? new Date(new Date(leadingCandidate.created_at).getTime() + 7 * 86400000)).getTime()
    : false;
  const winningTheme = leadingCandidate && (leadingCandidate.vote_count >= voteThreshold || (votingExpired && leadingCandidate.vote_count > 0))
    ? leadingCandidate
    : activeTheme;
  const currentWord = winningTheme?.word ?? "加油";

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      reloadMyVote(data.user, currentRound);
    });
    const savedDraft = window.localStorage.getItem(draftKey);
    if (savedDraft) setContent(savedDraft);

    const postsChannel = supabase
      .channel("community-wall-posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts", filter: "post_type=eq.wall" }, reloadPosts)
      .subscribe();
    const themesChannel = supabase
      .channel("community-wall-themes")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_wall_themes" }, reloadThemes)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(themesChannel);
    };
  }, [currentRound, reloadMyVote, reloadPosts, reloadThemes, supabase]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanContent = content.trim();
    if (cleanContent.length < 2) return setError("Please enter at least two Chinese characters.");
    if (cleanContent.length > 20) return setError("Please keep your message within 20 Chinese characters.");
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
      setError("Your message could not be published. Please try again later.");
      setSubmitting(false);
      return;
    }
    window.localStorage.removeItem(draftKey);
    setContent("");
    setSubmitting(false);
    await reloadPosts();
  }

  async function castVote(theme: CommunityWallTheme) {
    if (!user) {
      window.location.href = "/?auth=login&next=/community/wall";
      return;
    }
    if (votingThemeId) return;
    setVotingThemeId(theme.id);
    setVoteError("");

    if (myVoteThemeId && myVoteThemeId !== theme.id) {
      const { error: deleteError } = await supabase
        .from("community_wall_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("round_no", theme.round_no);
      if (deleteError) {
      setVoteError("Your vote could not be changed. Please try again later.");
        setVotingThemeId(null);
        return;
      }
    }

    if (myVoteThemeId === theme.id) {
      const { error: deleteError } = await supabase
        .from("community_wall_votes")
        .delete()
        .eq("user_id", user.id)
        .eq("round_no", theme.round_no);
      if (deleteError) setVoteError("Your vote could not be removed. Please try again later.");
      else setMyVoteThemeId(null);
    } else {
      const { error: insertError } = await supabase.from("community_wall_votes").insert({
        theme_id: theme.id,
        round_no: theme.round_no,
        user_id: user.id,
      });
    if (insertError) setVoteError("Your vote was not recorded. Please refresh and try again.");
      else setMyVoteThemeId(theme.id);
    }
    await reloadThemes();
    setVotingThemeId(null);
  }

  const wallItems = useMemo<WallItem[]>(() => livePosts.length
    ? livePosts.map((post) => ({
        id: post.id,
        content: post.content,
      author: post.is_anonymous ? "Anonymous Learner" : post.display_name,
        official: false,
      }))
    : officialPrompts.map((prompt, index) => ({
        id: `official-${index}`,
        content: prompt,
      author: "Write HSK Study Tip",
        official: true,
      })), [livePosts, officialPrompts]);

  return (
    <div className="wall-experience">
      <section className="wall-canvas-panel">
        <div className="wall-canvas-heading">
          <div><span className="eyebrow">This Week&apos;s Community Message</span><h1>{currentWord}</h1></div>
          <p>{livePosts.length ? `${livePosts.length} messages are forming these Chinese characters in real time.` : "Study tips currently form the characters while we wait for the first community message."}</p>
        </div>
        <TextMosaic items={wallItems} word={currentWord} />
          <p className="wall-hover-tip">Hover over the mosaic to read each message and see who posted it.</p>
      </section>

      <aside className="wall-sidebar">
        <div className="wall-compose-copy">
              <span>Share Some Encouragement</span>
              <h2>Make your message part of “{currentWord}”.</h2>
              <p>Write up to 20 Chinese characters. Your message will join the mosaic in real time.</p>
        </div>
        <form className="wall-inline-form" onSubmit={publish}>
              <textarea value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} maxLength={20} placeholder="例如：慢一点也没关系，继续走。" />
          <div className="wall-form-meta"><span>{content.length} / 20</span></div>
          <div className="community-categories">
            {(Object.keys(communityCategoryLabels) as Array<keyof typeof communityCategoryLabels>).map((key) => (
              <button type="button" className={category === key ? "selected" : ""} onClick={() => setCategory(key)} key={key}>{communityCategoryLabels[key]}</button>
            ))}
          </div>
                <label className="community-anonymous"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />Post anonymously</label>
          {error && <p className="community-compose-error" role="alert">{error}</p>}
              <button className="wall-publish-button" type="submit" disabled={submitting}>{submitting ? "Publishing…" : user ? "Add to the Wall" : "Sign In to Post"}</button>
        </form>

        <div className="wall-recent">
              <div><strong>Live Messages</strong><span>{livePosts.length ? "Community posts" : "Study examples"}</span></div>
          <ul>{wallItems.slice(0, 9).map((item) => <li key={item.id}><span>{item.content}</span><small>{item.author}</small></li>)}</ul>
        </div>
      </aside>

      <section className="wall-next-themes">
        <div>
            <span>What Should We Create Next?</span>
            <p>Sign in to vote for a theme. Each learner receives one vote per round and may change it anytime. The wall changes when a theme reaches {voteThreshold} votes.</p>
          {voteError && <small className="wall-vote-error">{voteError}</small>}
        </div>
        {candidates.map((theme) => {
          const selected = myVoteThemeId === theme.id;
          const isWinner = winningTheme?.id === theme.id;
          return (
            <button
              type="button"
              className={`wall-theme-card${selected ? " selected" : ""}${isWinner ? " winner" : ""}`}
              onClick={() => castVote(theme)}
              disabled={votingThemeId !== null}
              key={theme.id}
            >
                    <span className="wall-theme-card-top"><strong>{theme.word}</strong><b>{theme.vote_count} votes</b></span>
              <span>{theme.description}</span>
              <span className="wall-vote-progress"><i style={{ width: `${Math.min(100, theme.vote_count / voteThreshold * 100)}%` }} /></span>
                    <small>{isWinner ? "Currently on the wall" : selected ? "Voted · Click to remove" : user ? "Vote for this theme" : "Sign in to vote"}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
