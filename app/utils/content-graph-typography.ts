/** Vue Flow scales text along with its viewport; enforce a screen-space floor. */
export function contentGraphTypography(
    width: number,
    rem: number,
    bodyFontSize = rem,
) {
    const fontSize = Math.min(5 * rem, Math.max(2.5 * rem, width * 0.075));
    const nestedLabelScale = 1;
    // Match body text size after Vue Flow's viewport scaling.
    const minZoom = bodyFontSize / fontSize;
    return { fontSize, minZoom, nestedLabelScale };
}
