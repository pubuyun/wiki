const fontAssetBase = "https://static.igem.wiki/teams/6133/wiki/fonts/";

/** The upload service normalizes font filenames to lowercase and hyphens. */
export function fontAssetUrl(filename: string): string {
    return fontAssetBase + filename.toLowerCase().replaceAll("_", "-");
}
