export function useHomeIntroState() {
    const settled = useState("home-intro-settled", () => false);
    return { settled };
}
