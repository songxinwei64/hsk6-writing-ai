import CommunityWall, { type CommunityWallTheme } from "../../../components/community-wall";
import { officialWallPrompts, type CommunityPost } from "../../../lib/community";
import { createClient } from "../../../utils/supabase/server";

export const dynamic = "force-dynamic";

export default async function CommunityWallPage() {
  const supabase = await createClient();
  const { data: posts, error } = await supabase
    .from("community_posts")
    .select("id,user_id,post_type,practice_item_id,category,content,display_name,is_anonymous,created_at")
    .eq("post_type", "wall")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) throw new Error(`Unable to load the encouragement wall: ${error.message}`);

  const { data: themes, error: themesError } = await supabase
    .from("community_wall_themes")
    .select("id,round_no,word,description,status,vote_count,ends_at,created_at")
    .in("status", ["active", "candidate"])
    .order("created_at", { ascending: true });

  if (themesError) throw new Error(`Unable to load wall themes: ${themesError.message}`);

  return (
    <main className="wall-page">
      <div className="wall-page-top"><span>激励文字墙</span><small>鼓励与陪伴</small></div>
      <CommunityWall
        posts={(posts ?? []) as CommunityPost[]}
        themes={(themes ?? []) as CommunityWallTheme[]}
        officialPrompts={officialWallPrompts}
      />
    </main>
  );
}
