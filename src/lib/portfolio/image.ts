export function isOptimizablePortfolioImage(source: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return false;
  }

  try {
    const imageUrl = new URL(source);
    const storageUrl = new URL(supabaseUrl);

    return (
      imageUrl.origin === storageUrl.origin &&
      imageUrl.pathname.startsWith("/storage/v1/object/")
    );
  } catch {
    return false;
  }
}
