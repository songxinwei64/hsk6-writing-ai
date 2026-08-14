"use client";

import { useState } from "react";

export default function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST" });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Unable to start checkout.");
      window.location.assign(result.url);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout.");
      setIsLoading(false);
    }
  }

  return (
    <div className="checkout-action">
      <button className="membership-primary-action" type="button" onClick={startCheckout} disabled={isLoading}>
        {isLoading ? "正在打开结账页面…" : "订阅会员（每月自动续费）"}
      </button>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </div>
  );
}
