import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

const LEMON_API = "https://api.lemonsqueezy.com/v1";

function apiHeaders(apiKey: string) {
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${apiKey}`,
  };
}

export async function POST(request: Request) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!apiKey || !variantId) {
    const missing = [
      !apiKey ? "LEMONSQUEEZY_API_KEY" : null,
      !variantId ? "LEMONSQUEEZY_VARIANT_ID" : null,
    ].filter(Boolean).join(", ");
    return NextResponse.json({ error: `Payment configuration is missing: ${missing}.` }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Please sign in before upgrading." }, { status: 401 });
  }

  const storesResponse = await fetch(`${LEMON_API}/stores`, {
    headers: apiHeaders(apiKey),
    cache: "no-store",
  });
  const storesResult = await storesResponse.json() as {
    data?: Array<{ id: string }>;
    errors?: Array<{ detail?: string }>;
  };
  const storeId = storesResult.data?.[0]?.id;
  if (!storesResponse.ok || !storeId) {
    console.error("Unable to load Lemon Squeezy store:", storesResult.errors?.[0]?.detail);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const isTestMode = process.env.LEMONSQUEEZY_TEST_MODE === "true";
  const name = String(user.user_metadata?.full_name || "").trim();
  const checkoutResponse = await fetch(`${LEMON_API}/checkouts`, {
    method: "POST",
    headers: apiHeaders(apiKey),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: {
            redirect_url: `${siteUrl}/membership?checkout=success`,
            receipt_button_text: "Return to Cabbage HSK Writing",
            receipt_link_url: `${siteUrl}/membership`,
          },
          checkout_options: {
            embed: false,
          },
          checkout_data: {
            email: user.email,
            ...(name ? { name } : {}),
            custom: { user_id: user.id },
          },
          test_mode: isTestMode,
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });
  const checkoutResult = await checkoutResponse.json() as {
    data?: { attributes?: { url?: string } };
    errors?: Array<{ detail?: string }>;
  };
  const checkoutUrl = checkoutResult.data?.attributes?.url;
  if (!checkoutResponse.ok || !checkoutUrl) {
    console.error("Unable to create Lemon Squeezy checkout:", checkoutResult.errors?.[0]?.detail);
    return NextResponse.json({ error: "Unable to start checkout." }, { status: 502 });
  }

  return NextResponse.json({ url: checkoutUrl });
}
