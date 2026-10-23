import type { NextConfig } from "next";
import { ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT } from "./src/lib/admin/upload-policy";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseImagePattern = supabaseUrl
  ? new URL("/storage/v1/object/**", supabaseUrl)
  : null;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      bodySizeLimit: ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT,
    },
  },
  images: {
    remotePatterns: supabaseImagePattern ? [supabaseImagePattern] : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
