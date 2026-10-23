import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const downloadName = "Mahmudul-Hassan-Masum-CV.pdf";

function unavailable(status: 404 | 503) {
  return new Response(
    status === 404 ? "No published CV is available." : "The CV is temporarily unavailable.",
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET() {
  if (!getSupabasePublicConfig()) {
    return unavailable(404);
  }

  const supabase = await createSupabaseServerClient();
  const settingsResult = await supabase
    .from("site_settings")
    .select("resume_asset_id")
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle();

  if (settingsResult.error) {
    console.error("Unable to look up the published CV.", {
      code: settingsResult.error.code ?? "unknown",
    });
    return unavailable(503);
  }

  const resumeResult = settingsResult.data?.resume_asset_id
    ? await supabase
        .from("resume_assets")
        .select("storage_path")
        .eq("id", settingsResult.data.resume_asset_id)
        .eq("is_published", true)
        .maybeSingle()
    : await supabase
        .from("resume_assets")
        .select("storage_path")
        .eq("is_published", true)
        .order("display_order")
        .limit(1)
        .maybeSingle();

  if (resumeResult.error) {
    console.error("Unable to look up the published CV asset.", {
      code: resumeResult.error.code ?? "unknown",
    });
    return unavailable(503);
  }

  if (!resumeResult.data) {
    return unavailable(404);
  }

  const { data, error } = await supabase.storage
    .from("resume-documents")
    .createSignedUrl(resumeResult.data.storage_path, 300, {
      download: downloadName,
    });

  if (error) {
    console.error("Unable to sign the published CV asset.", {
      code: error.name,
    });
    return unavailable(503);
  }

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      Location: data.signedUrl,
    },
  });
}
