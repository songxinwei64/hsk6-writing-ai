import { createClient } from "../utils/supabase/server";

export type PracticeAttemptSummary = {
  count: number;
  latestAt: string;
};

export async function getPracticeAttemptSummaries(
  practiceItemIds: string[],
): Promise<Record<string, PracticeAttemptSummary>> {
  if (!practiceItemIds.length) return {};

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("practice_attempts")
    .select("practice_item_id,completed_at,updated_at")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .in("practice_item_id", practiceItemIds);

  if (error) {
    console.error("Unable to load practice attempt summaries:", error.message);
    return {};
  }

  return (data ?? []).reduce<Record<string, PracticeAttemptSummary>>((summaries, attempt) => {
    const itemId = attempt.practice_item_id;
    const completedAt = attempt.completed_at ?? attempt.updated_at;
    const current = summaries[itemId];

    summaries[itemId] = {
      count: (current?.count ?? 0) + 1,
      latestAt: !current || completedAt > current.latestAt ? completedAt : current.latestAt,
    };
    return summaries;
  }, {});
}
