export const ADMIN_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const ADMIN_UPLOAD_ACTION_BODY_SIZE_LIMIT = "11mb";

export function parseByteLimit(value: string): number {
  const match = /^(\d+)(kb|mb|gb)$/i.exec(value);

  if (!match) {
    throw new Error(`Unsupported byte limit: ${value}`);
  }

  const unit = match[2].toLowerCase();
  const multiplier =
    unit === "kb" ? 1024 : unit === "mb" ? 1024 ** 2 : 1024 ** 3;

  return Number(match[1]) * multiplier;
}
