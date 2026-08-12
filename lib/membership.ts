import { createClient } from "../utils/supabase/server";

export type MembershipAccess = {
  isAuthenticated: boolean;
  isPaidMember: boolean;
};

export async function getMembershipAccess(): Promise<MembershipAccess> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isAuthenticated: false, isPaidMember: false };

  const { data, error } = await supabase
    .from("user_memberships")
    .select("status,expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(`Unable to load membership: ${error.message}`);

  const isPaidMember = Boolean(
    data?.status === "active"
    && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now()),
  );

  return { isAuthenticated: true, isPaidMember };
}
