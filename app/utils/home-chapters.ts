export const HOME_CHAPTERS = {
    expelliodor: "pause:Expelliodor",
    smell: "pause:?!Odor!?",
    worldStat: "pause:Odor around the world",
    abcc11Gene: "pause:The ABCC11 gene",
    abcc11Pathway: "pause:From sweat gland to bacteria",
    peptsh: "pause:PepTsh transports the precursor",
    pepv: "pause:PepV cleaves the precursor",
    patb: "pause:PatB produces the odor molecule",
    odorMolecule: "pause:3M3SH causes odor",
    currentLimits: "pause:The limits of current solutions",
    currentMechanism: "pause:How current products work",
    productSideEffects: "pause:Side effects of current products",
    surgery: "pause:Surgery as a last resort",
    surgeryRisks: "pause:The risks of surgery",
    productIntro: "pause:A safer, targeted answer",
    product: "pause:Meet Expelliodor",
    solutionOverview: "pause:Three targeted solutions",
    precursorBinder: "pause:Precursor Binder",
    transporterBinder: "pause:Transporter Binder",
    cgtase: "pause:CGTase",
} as const;

export type HomeChapterLabel =
    (typeof HOME_CHAPTERS)[keyof typeof HOME_CHAPTERS];

export const HOME_CHAPTER_LABELS = Object.values(HOME_CHAPTERS);

export function homeChapterTitle(label: string) {
    return label.replace(/^pause:/, "");
}

export function homeChapterActivationLabel(label: string) {
    return label.replace(/^pause:/, "active:");
}
