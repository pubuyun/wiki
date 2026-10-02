import { addCollection } from "@iconify/vue/offline";
import collections from "~/data/icons.json";

export default defineNuxtPlugin({
    name: "local-icons",
    enforce: "pre",
    setup() {
        for (const collection of collections) {
            addCollection(collection);
        }
    },
});
