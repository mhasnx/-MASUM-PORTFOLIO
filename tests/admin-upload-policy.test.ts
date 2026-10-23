import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";
import {
  ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT,
  ADMIN_UPLOAD_MAX_BYTES,
  parseByteLimit,
} from "../src/lib/admin/upload-policy";

describe("admin upload request policy", () => {
  it("applies the configured Server Action body limit in Next.js", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe(
      ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT,
    );
  });

  it("allows the maximum supported file plus multipart request overhead", () => {
    expect(parseByteLimit(ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT)).toBeGreaterThanOrEqual(
      ADMIN_UPLOAD_MAX_BYTES + 20 * 1024,
    );
  });

  it("rejects unsupported byte-limit formats", () => {
    expect(() => parseByteLimit("10mb!")).toThrow("Unsupported byte limit");
  });
});
