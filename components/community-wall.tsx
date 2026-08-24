"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { communityCategoryLabels, type CommunityPost } from "../lib/community";
import { useSiteLocale, type SiteLocale } from "../lib/use-site-locale";

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

function TextMosaic({ items, word, locale }: { items: WallItem[]; word: string; locale: SiteLocale }) {
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
    <div
      className="word-mosaic"
      ref={stageRef}
      aria-label={locale === "zh" ? `由社区留言组成的汉字“${word}”` : locale === "ko" ? `커뮤니티 메시지로 만든 한자 “${word}”` : `The Chinese characters “${word}” formed by community messages`}
    >
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
  const locale = useSiteLocale();
  const text = (zh: string, en: string, ko: string) => locale === "zh" ? zh : locale === "ko" ? ko : en;
  const categoryLabels: Record<keyof typeof communityCategoryLabels, string> = {
    check_in: text("今日打卡", "Daily Check-in", "오늘의 학습"),
    insight: text("学习心得", "Study Notes", "학습 소감"),
    question: text("遇到困难", "A Challenge", "어려운 점"),
    encouragement: text("给大家加油", "Encouragement", "응원하기"),
  };
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
    if (cleanContent.length < 2) return setError(text("请至少输入两个汉字。", "Please enter at least two Chinese characters.", "중국어 두 글자 이상 입력해 주세요."));
    if (cleanContent.length > 20) return setError(text("留言请控制在二十个汉字以内。", "Please keep your message within 20 Chinese characters.", "메시지는 중국어 20자 이내로 작성해 주세요."));
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
      setError(text("留言发布失败，请稍后再试。", "Your message could not be published. Please try again later.", "메시지를 게시하지 못했습니다. 잠시 후 다시 시도해 주세요."));
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
      setVoteError(text("投票修改失败，请稍后再试。", "Your vote could not be changed. Please try again later.", "투표를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요."));
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
      if (deleteError) setVoteError(text("投票取消失败，请稍后再试。", "Your vote could not be removed. Please try again later.", "투표를 취소하지 못했습니다. 잠시 후 다시 시도해 주세요."));
      else setMyVoteThemeId(null);
    } else {
      const { error: insertError } = await supabase.from("community_wall_votes").insert({
        theme_id: theme.id,
        round_no: theme.round_no,
        user_id: user.id,
      });
    if (insertError) setVoteError(text("投票未能记录，请刷新页面后重试。", "Your vote was not recorded. Please refresh and try again.", "투표가 저장되지 않았습니다. 새로고침 후 다시 시도해 주세요."));
      else setMyVoteThemeId(theme.id);
    }
    await reloadThemes();
    setVotingThemeId(null);
  }

  const wallItems = useMemo<WallItem[]>(() => livePosts.length
    ? livePosts.map((post) => ({
        id: post.id,
        content: post.content,
      author: post.is_anonymous ? text("匿名学习者", "Anonymous Learner", "익명 학습자") : post.display_name,
        official: false,
      }))
    : officialPrompts.map((prompt, index) => ({
        id: `official-${index}`,
        content: prompt,
      author: text("Write HSK 学习提示", "Write HSK Study Tip", "Write HSK 학습 도움말"),
        official: true,
       })), [livePosts, officialPrompts, locale]);

  return (
    <div className="wall-experience">
      <section className="wall-canvas-panel">
        <div className="wall-canvas-heading">
          <div><span className="eyebrow">{text("本期共同写成", "This Week's Community Message", "이번 주 함께 만드는 글자")}</span><h1>{currentWord}</h1></div>
          <p>{livePosts.length
            ? text(`${livePosts.length} 条留言正在实时组成这个汉字。`, `${livePosts.length} messages are forming these Chinese characters in real time.`, `${livePosts.length}개의 메시지가 실시간으로 이 한자를 만들고 있습니다.`)
            : text("还没有社区留言，当前由学习提示组成文字墙。", "Study tips currently form the characters while we wait for the first community message.", "첫 커뮤니티 메시지를 기다리는 동안 학습 도움말로 글자 벽을 만들고 있습니다.")}</p>
        </div>
        <TextMosaic items={wallItems} word={currentWord} locale={locale} />
          <p className="wall-hover-tip">{text("将鼠标移到文字上，可以查看完整留言和发布者。", "Hover over the mosaic to read each message and see who posted it.", "글자 위에 마우스를 올리면 전체 메시지와 작성자를 확인할 수 있습니다.")}</p>
      </section>

      <aside className="wall-sidebar">
        <div className="wall-compose-copy">
              <span>{text("写一句鼓励的话", "Share Some Encouragement", "응원의 한마디 쓰기")}</span>
              <h2>{text(`让你的留言成为“${currentWord}”的一部分。`, `Make your message part of “${currentWord}”.`, `내 메시지를 “${currentWord}”의 일부로 만들어 보세요.`)}</h2>
              <p>{text("最多输入二十个汉字，你的留言会实时加入文字墙。", "Write up to 20 Chinese characters. Your message will join the mosaic in real time.", "중국어 20자 이내로 작성하면 메시지가 실시간으로 글자 벽에 추가됩니다.")}</p>
        </div>
        <form className="wall-inline-form" onSubmit={publish}>
               <textarea value={content} onChange={(event) => { setContent(event.target.value); setError(""); }} maxLength={20} placeholder={text("例如：慢一点也没关系，继续走。", "Example: Keep going, one step at a time.", "예: 천천히 가도 괜찮아, 계속 나아가자.")} />
          <div className="wall-form-meta"><span>{content.length} / 20</span></div>
          <div className="community-categories">
            {(Object.keys(communityCategoryLabels) as Array<keyof typeof communityCategoryLabels>).map((key) => (
               <button type="button" className={category === key ? "selected" : ""} onClick={() => setCategory(key)} key={key}>{categoryLabels[key]}</button>
            ))}
          </div>
                 <label className="community-anonymous"><input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />{text("匿名发布", "Post anonymously", "익명으로 게시")}</label>
          {error && <p className="community-compose-error" role="alert">{error}</p>}
               <button className="wall-publish-button" type="submit" disabled={submitting}>{submitting ? text("正在发布……", "Publishing…", "게시 중…") : user ? text("加入文字墙", "Add to the Wall", "글자 벽에 추가") : text("登录后发布", "Sign In to Post", "로그인 후 게시")}</button>
        </form>

        <div className="wall-recent">
               <div><strong>{text("实时短句", "Live Messages", "실시간 메시지")}</strong><span>{livePosts.length ? text("真实留言", "Community posts", "커뮤니티 글") : text("学习示例", "Study examples", "학습 예시")}</span></div>
          <ul>{wallItems.slice(0, 9).map((item) => <li key={item.id}><span>{item.content}</span><small>{item.author}</small></li>)}</ul>
        </div>
      </aside>

      <section className="wall-next-themes">
        <div>
             <span>{text("下一期写什么？", "What Should We Create Next?", "다음에는 어떤 글자를 만들까요?")}</span>
             <p>{text(`登录后可为主题投票。每轮每位学习者有一票，可随时更改；主题获得 ${voteThreshold} 票后，文字墙会自动更换。`, `Sign in to vote for a theme. Each learner receives one vote per round and may change it anytime. The wall changes when a theme reaches ${voteThreshold} votes.`, `로그인 후 주제에 투표할 수 있습니다. 라운드마다 한 표를 행사하고 언제든 변경할 수 있으며, ${voteThreshold}표를 받으면 글자 벽이 바뀝니다.`)}</p>
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
                     <span className="wall-theme-card-top"><strong>{theme.word}</strong><b>{text(`${theme.vote_count} 票`, `${theme.vote_count} votes`, `${theme.vote_count}표`)}</b></span>
              <span>{theme.description}</span>
              <span className="wall-vote-progress"><i style={{ width: `${Math.min(100, theme.vote_count / voteThreshold * 100)}%` }} /></span>
                     <small>{isWinner ? text("正在组成文字墙", "Currently on the wall", "현재 글자 벽에 표시 중") : selected ? text("已投票，点击可取消", "Voted · Click to remove", "투표함 · 클릭하여 취소") : user ? text("为这个主题投票", "Vote for this theme", "이 주제에 투표") : text("登录后投票", "Sign in to vote", "로그인 후 투표")}</small>
            </button>
          );
        })}
      </section>
    </div>
  );
}
