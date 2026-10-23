export const PORTFOLIO_IMAGE_REFERENCE_PREFIX = "portfolio-asset:";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function makePortfolioImageReference(assetId: string): string {
  if (!uuidPattern.test(assetId)) {
    throw new Error("Choose a valid uploaded portfolio image.");
  }
  return `${PORTFOLIO_IMAGE_REFERENCE_PREFIX}${assetId}`;
}

export function isPortfolioImageReference(value: string): boolean {
  return parsePortfolioImageReference(value) !== null;
}

export function parsePortfolioImageReference(
  value: string | null | undefined,
): string | null {
  if (!value?.startsWith(PORTFOLIO_IMAGE_REFERENCE_PREFIX)) {
    return null;
  }
  const assetId = value.slice(PORTFOLIO_IMAGE_REFERENCE_PREFIX.length);
  return uuidPattern.test(assetId) ? assetId : null;
}

export async function resolvePortfolioImageReference(
  reference: string | null,
  publishedAssets: ReadonlyMap<string, string>,
  createPublishedUrl: (storagePath: string) => Promise<string>,
): Promise<string | null> {
  if (!reference?.startsWith(PORTFOLIO_IMAGE_REFERENCE_PREFIX)) {
    return reference;
  }
  const assetId = parsePortfolioImageReference(reference);
  const storagePath = assetId ? publishedAssets.get(assetId) : undefined;
  return storagePath ? createPublishedUrl(storagePath) : null;
}
