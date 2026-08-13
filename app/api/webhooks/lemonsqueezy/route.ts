import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../utils/supabase/admin";

type SubscriptionAttributes = {
  customer_id?: number | string;
  variant_id?: number | string;
  status?: string;
  cancelled?: boolean;
  renews_at?: string | null;
  ends_at?: string | null;
  test_mode?: boolean;
  urls?: { customer_portal?: string | null };
};

type WebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: { user_id?: string };
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: SubscriptionAttributes;
  };
};

function isValidUuid(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function hasValidSignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");
  return expectedBuffer.length === signatureBuffer.length
    && timingSafeEqual(expectedBuffer, signatureBuffer);
}

function getMembershipState(eventName: string, attributes: SubscriptionAttributes) {
  if (eventName === "subscription_expired") {
    return { status: "inactive" as const, expiresAt: attributes.ends_at ?? new Date().toISOString() };
  }

  const activeStatuses = new Set(["active", "on_trial"]);
  if (activeStatuses.has(attributes.status ?? "")) {
    return { status: "active" as const, expiresAt: attributes.ends_at ?? null };
  }

  if ((eventName === "subscription_cancelled" || attributes.cancelled) && attributes.ends_at
    && new Date(attributes.ends_at).getTime() > Date.now()) {
    return { status: "active" as const, expiresAt: attributes.ends_at };
  }

  return { status: "inactive" as const, expiresAt: attributes.ends_at ?? null };
}

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const rawBody = await request.text();
  if (!hasValidSignature(rawBody, request.headers.get("x-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventName = payload.meta?.event_name ?? request.headers.get("x-event-name") ?? "";
  const supportedEvents = new Set([
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_expired",
  ]);
  if (!supportedEvents.has(eventName)) return NextResponse.json({ received: true });
  if (payload.data?.type !== "subscriptions" || !payload.data.id || !payload.data.attributes) {
    return NextResponse.json({ error: "Invalid subscription payload." }, { status: 400 });
  }

  const subscriptionId = payload.data.id;
  const attributes = payload.data.attributes;
  const configuredVariantId = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (configuredVariantId && String(attributes.variant_id) !== configuredVariantId) {
    return NextResponse.json({ error: "Unknown subscription variant." }, { status: 400 });
  }

  const admin = createAdminClient();
  let userId = payload.meta?.custom_data?.user_id;
  if (!isValidUuid(userId)) {
    const { data: existing, error } = await admin
      .from("user_memberships")
      .select("user_id")
      .eq("lemonsqueezy_subscription_id", subscriptionId)
      .maybeSingle();
    if (error) return NextResponse.json({ error: "Unable to find membership." }, { status: 500 });
    userId = existing?.user_id;
  }
  if (!isValidUuid(userId)) {
    return NextResponse.json({ error: "Missing customer account reference." }, { status: 400 });
  }

  const membership = getMembershipState(eventName, attributes);
  const { error } = await admin.from("user_memberships").upsert({
    user_id: userId,
    status: membership.status,
    expires_at: membership.expiresAt,
    lemonsqueezy_subscription_id: subscriptionId,
    lemonsqueezy_customer_id: attributes.customer_id == null ? null : String(attributes.customer_id),
    lemonsqueezy_variant_id: attributes.variant_id == null ? null : String(attributes.variant_id),
    customer_portal_url: attributes.urls?.customer_portal ?? null,
    test_mode: Boolean(attributes.test_mode),
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) {
    console.error("Unable to sync Lemon Squeezy membership:", error.message);
    return NextResponse.json({ error: "Unable to sync membership." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
