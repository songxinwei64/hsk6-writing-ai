import { createClient } from "../utils/supabase/server";
import { matchesLemonEnvironment } from "./lemon-environment";

export type MembershipAccess = {
  isAuthenticated: boolean;
  isPaidMember: boolean;
  status: "active" | "inactive" | null;
  startedAt: string | null;
  renewsAt: string | null;
  expiresAt: string | null;
  customerPortalUrl: string | null;
  isTestMode: boolean;
};

export async function getMembershipAccess(): Promise<MembershipAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return {
    isAuthenticated: false,
    isPaidMember: false,
    status: null,
    startedAt: null,
    renewsAt: null,
    expiresAt: null,
    customerPortalUrl: null,
    isTestMode: false,
  };

  const { data, error } = await supabase
    .from("user_memberships")
    .select("status,created_at,subscription_started_at,renews_at,expires_at,customer_portal_url,test_mode")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load membership: ${error.message}`);

  const environmentMatches = Boolean(data && matchesLemonEnvironment(data.test_mode));
  const isPaidMember = Boolean(
    environmentMatches
    && data?.status === "active"
    && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()),
  );

  return {
    isAuthenticated: true,
    isPaidMember,
    status: environmentMatches && (data?.status === "active" || data?.status === "inactive") ? data.status : null,
    startedAt: environmentMatches ? data?.subscription_started_at ?? data?.created_at ?? null : null,
    renewsAt: environmentMatches ? data?.renews_at ?? null : null,
    expiresAt: environmentMatches ? data?.expires_at ?? null : null,
    customerPortalUrl: environmentMatches ? data?.customer_portal_url ?? null : null,
    isTestMode: environmentMatches && Boolean(data?.test_mode),
  };
}
