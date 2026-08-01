"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

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

export default function AuthEntry() {
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
      setError("Password must be at least 8 characters.");
      setIsSubmitting(false);
      return;
    }

    if (mode === "sign-in") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message);
      else setIsOpen(false);
    } else {
      const firstName = String(form.get("firstName") || "").trim();
      const lastName = String(form.get("lastName") || "").trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) setError(authError.message);
      else if (data.session) setIsOpen(false);
      else setMessage("Check your email and click the confirmation link to finish signing up.");
    }
    setIsSubmitting(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setIsAccountOpen(false);
  }

  return (
    <div className="account-entry" ref={accountRef}>
      <button
        className={`account-button${user ? " signed-in" : ""}`}
        type="button"
        onClick={() => user ? setIsAccountOpen((open) => !open) : openModal()}
        aria-label={user ? "Open account menu" : "Open sign in"}
        aria-expanded={user ? isAccountOpen : undefined}
      >
        {user ? <span>{getUserInitial(user)}</span> : <UserIcon />}
      </button>

      {user && isAccountOpen && (
        <div className="account-menu">
          <strong>{user.user_metadata?.full_name || "Your account"}</strong>
          <span>{user.email}</span>
          <button type="button" onClick={handleSignOut}>Sign out</button>
        </div>
      )}

      {isOpen && (
        <div className="auth-overlay" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsOpen(false);
        }}>
          <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
            <button className="auth-close" type="button" onClick={() => setIsOpen(false)} aria-label="Close">×</button>
            <div className="auth-brand" aria-hidden="true">W</div>
            <h2 id="auth-title">{mode === "sign-in" ? "Sign in to Write HSK" : "Create your account"}</h2>
            <p className="auth-subtitle">
              {mode === "sign-in"
                ? "Welcome back! Please sign in to continue."
                : "Welcome! Please fill in the details to get started."}
            </p>

            <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={isSubmitting}>
              <GoogleIcon /><span>Continue with Google</span>
            </button>
            <div className="auth-divider"><span>or</span></div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <div className="name-row">
                  <label>
                    <span>First name</span>
                    <input name="firstName" type="text" placeholder="First name" autoComplete="given-name" required />
                  </label>
                  <label>
                    <span>Last name</span>
                    <input name="lastName" type="text" placeholder="Last name" autoComplete="family-name" required />
                  </label>
                </div>
              )}
              <label>
                <span>Email address</span>
                <input name="email" type="email" placeholder="Enter your email address" autoComplete="email" required />
              </label>
              <label>
                <span>Password</span>
                <div className="password-field">
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    <EyeIcon hidden={showPassword} />
                  </button>
                </div>
              </label>
              {error && <p className="auth-message error" role="alert">{error}</p>}
              {message && <p className="auth-message success" role="status">{message}</p>}
              <button className="auth-continue" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Please wait…" : <>Continue <span>›</span></>}
              </button>
            </form>

            <div className="auth-switch">
              {mode === "sign-in" ? (
                <><span>Don&apos;t have an account?</span><button type="button" onClick={() => changeMode("sign-up")}>Sign up</button></>
              ) : (
                <><span>Already have an account?</span><button type="button" onClick={() => changeMode("sign-in")}>Sign in</button></>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
