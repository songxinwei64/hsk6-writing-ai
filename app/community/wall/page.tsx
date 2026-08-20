import CommunityWall, { type CommunityWallTheme } from "../../../components/community-wall";
import { officialWallPrompts, type CommunityPost } from "../../../lib/community";
import { createClient } from "../../../utils/supabase/server";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "HSK Study Motivation Wall",
  description: "Share short encouragement and study motivation with the Write HSK community while preparing for HSK 6 writing.",
  path: "/community/wall",
  keywords: ["HSK study motivation", "HSK 6 community", "Chinese learners encouragement"],
});

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
      <div className="wall-page-top"><span>Motivation Wall</span><small>Encouragement & Support</small></div>
      <CommunityWall
        posts={(posts ?? []) as CommunityPost[]}
        themes={(themes ?? []) as CommunityWallTheme[]}
        officialPrompts={officialWallPrompts}
      />
    </main>
  );
}
