"use client";

import { createClient } from "../utils/supabase/client";

export async function saveCompletedAttempt({
  practiceItemId,
  answerTitle,
  answerText,
}: {
  practiceItemId: string;
  answerTitle?: string;
  answerText: string;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { saved: false as const, reason: "signed-out" as const };

  const completedAt = new Date().toISOString();
  const { error } = await supabase.from("practice_attempts").insert({
    user_id: user.id,
    practice_item_id: practiceItemId,
    status: "completed",
    answer_title: answerTitle?.trim() || null,
    answer_text: answerText.trim(),
    completed_at: completedAt,
    updated_at: completedAt,
  });

  if (error) return { saved: false as const, reason: "error" as const, error };
  return { saved: true as const };
}
