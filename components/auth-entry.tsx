"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useSiteLocale } from "../lib/use-site-locale";

type AuthMode = "sign-in" | "sign-up";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c.5-4 2.7-6 6.5-6s6 2 6.5 6" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.7 4.7 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3a10 10 0 0 0 0 9.1L6.4 14Z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.7 9.7 0 0 0 12 2a10 10 0 0 0-9 5.5l3.4 2.6C7.2 7.7 9.4 6 12 6Z" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.3" />
      {hidden && <path d="m4 4 16 16" />}
    </svg>
  );
}

function getUserInitial(user: User) {
  const name = user.user_metadata?.first_name || user.user_metadata?.full_name;
  return String(name || user.email || "U").trim().charAt(0).toUpperCase();
}

export default function AuthEntry({
  autoOpen = false,
  nextPath = "/",
  prominent = false,
  topbar = false,
}: {
  autoOpen?: boolean;
  nextPath?: string;
  prominent?: boolean;
  topbar?: boolean;
}) {
  const router = useRouter();
  const locale = useSiteLocale();
  const text = (zh: string, en: string, ko: string) => locale === "zh" ? zh : locale === "ko" ? ko : en;
  const supabase = useMemo(() => createClient(), []);
  const accountRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (autoOpen) openModal();
  // `openModal` only resets local modal state and is intentionally run once per flag change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  useEffect(() => {
    function closeAccountMenu(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setIsAccountOpen(false);
    }
    document.addEventListener("mousedown", closeAccountMenu);
    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openModal() {
    setMode("sign-in");
    setShowPassword(false);
    setError("");
    setMessage("");
    setIsOpen(true);
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setShowPassword(false);
    setError("");
    setMessage("");
  }

  async function handleGoogleSignIn() {
    setError("");
    setIsSubmitting(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });
    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    if (mode === "sign-up" && password.length < 8) {
      setError(text("密码至少需要8个字符。", "Password must be at least 8 characters.", "비밀번호는 8자 이상이어야 합니다."));
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-in") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(text("邮箱或密码不正确，请重新检查。", authError.message, "이메일 또는 비밀번호를 다시 확인해 주세요."));
      else {
        setIsOpen(false);
        router.push(nextPath);
        router.refresh();
      }
    } else {
      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });
      if (authError) setError(text("注册失败，请检查填写内容后重试。", authError.message, "회원가입에 실패했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요."));
      else if (data.session) {
        setIsOpen(false);
        router.push(nextPath);
        router.refresh();
      }
      else setMessage(text("请打开确认邮件并点击其中的链接，以完成注册。", "Check your email and click the confirmation link to finish signing up.", "확인 이메일을 열고 링크를 눌러 회원가입을 완료해 주세요."));
    }
    setIsSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
  }

  return (
    <div className="account-entry" ref={accountRef}>
      {!user && topbar ? (
        <div className="topbar-auth-actions">
          <button type="button" onClick={openModal}>{text("登录", "Sign in", "로그인")}</button>
          <button className="signup" type="button" onClick={() => { openModal(); setMode("sign-up"); }}>{text("注册", "Sign up", "회원가입")}</button>
        </div>
      ) : <button
        className={`account-button${user ? " signed-in" : ""}${prominent ? " prominent" : ""}`}
        type="button"
        onClick={() => user ? setIsAccountOpen((open) => !open) : openModal()}
        aria-label={user ? text("打开账户菜单", "Open account menu", "계정 메뉴 열기") : text("打开登录窗口", "Open sign in", "로그인 창 열기")}
        aria-expanded={user ? isAccountOpen : undefined}
      >
        {user ? <span className="account-avatar-letter">{getUserInitial(user)}</span> : <UserIcon />}
        {prominent && <span className="account-button-label">{user ? text("我的账户", "My account", "내 계정") : text("登录 / 注册", "Sign in / Sign up", "로그인 / 회원가입")}</span>}
      </button>}

      {user && isAccountOpen && (
        <div className="account-menu">
          <strong>{user.user_metadata?.full_name || text("我的账户", "Your account", "내 계정")}</strong>
          <span>{user.email}</span>
          <button type="button" onClick={handleSignOut}>{text("退出登录", "Sign out", "로그아웃")}</button>
        </div>
      )}

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="auth-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="auth-close" type="button" onClick={() => setIsOpen(false)} aria-label={text("关闭", "Close", "닫기")}>×</button>
            <div className="auth-brand" aria-hidden="true">W</div>
            <h2 id="auth-title">{mode === "sign-in" ? text("登录 Write HSK", "Sign in to Write HSK", "Write HSK 로그인") : text("创建账户", "Create your account", "계정 만들기")}</h2>
            <p className="auth-subtitle">
              {mode === "sign-in"
                ? text("欢迎回来，请登录后继续。", "Welcome back! Please sign in to continue.", "다시 오신 것을 환영합니다. 계속하려면 로그인하세요.")
                : text("欢迎，请填写以下信息完成注册。", "Welcome! Please fill in the details to get started.", "환영합니다. 아래 정보를 입력해 주세요.")}
            </p>

            <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              <GoogleIcon /><span>{text("使用 Google 继续", "Continue with Google", "Google로 계속")}</span>
            </button>
            <div className="auth-divider"><span>{text("或", "or", "또는")}</span></div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <div className="name-row">
                  <label>
                    <span>{text("名字", "First name", "이름")}</span>
                    <input name="firstName" type="text" placeholder={text("名字", "First name", "이름")} autoComplete="given-name" required />
                  </label>
                  <label>
                    <span>{text("姓氏", "Last name", "성")}</span>
                    <input name="lastName" type="text" placeholder={text("姓氏", "Last name", "성")} autoComplete="family-name" required />
                  </label>
                </div>
              )}
              <label>
                <span>{text("邮箱地址", "Email address", "이메일 주소")}</span>
                <input name="email" type="email" placeholder={text("请输入邮箱地址", "Enter your email address", "이메일 주소를 입력하세요")} autoComplete="email" required />
              </label>
              <label>
                <span>{text("密码", "Password", "비밀번호")}</span>
                <div className="password-field">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder={text("请输入密码", "Enter your password", "비밀번호를 입력하세요")}
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? text("隐藏密码", "Hide password", "비밀번호 숨기기") : text("显示密码", "Show password", "비밀번호 표시")}>
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
              </label>
              {error && <p className="auth-message error" role="alert">{error}</p>}
              {message && <p className="auth-message success" role="status">{message}</p>}
              <button className="auth-continue" type="submit" disabled={isSubmitting}>
                {isSubmitting ? text("请稍候……", "Please wait…", "잠시만 기다려 주세요……") : <>{text("继续", "Continue", "계속")} <span>›</span></>}
              </button>
            </form>

            <div className="auth-switch">
              {mode === "sign-in" ? (
                <><span>{text("还没有账户？", "Don&apos;t have an account?", "계정이 없으신가요?")}</span><button type="button" onClick={() => changeMode("sign-up")}>{text("注册", "Sign up", "회원가입")}</button></>
              ) : (
                <><span>{text("已经有账户？", "Already have an account?", "이미 계정이 있으신가요?")}</span><button type="button" onClick={() => changeMode("sign-in")}>{text("登录", "Sign in", "로그인")}</button></>
              )}
            </div>
          </section>
        </div>,
        document.body,
      )}
    </div>
  );
}
