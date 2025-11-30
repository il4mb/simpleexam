import {
    adventurer,
    avataaars,
    croodles,
    lorelei,
    micah,
    pixelArt,
} from "@dicebear/collection";

export const collectionMap = {
    adventurer,
    avataaars,
    // "big-ears": bigEars,
    croodles,
    lorelei,
    micah,
    "pixel-art": pixelArt,
    // shapes,
    // thumbs,
} as const;
export const collectionMapNamed: { [K in keyof typeof collectionMap]: string; } = {
    adventurer: "Adventurer",
    avataaars: "Avataaars",
    // "big-ears": "Big Ears",
    croodles: "Croodles",
    lorelei: "Lorelei",
    micah: "Micah",
    "pixel-art": "Pixel Art",
    // shapes: "Shapes",
    // thumbs: "Thumbs",
};

export type StyleName = keyof typeof collectionMap;
export type StyleCollection<T extends StyleName> = typeof collectionMap[T];
export type StyleOptions<T extends StyleName> = Parameters<StyleCollection<T>["create"]>[0]["options"];

export const getAvatarCollection = <T extends StyleName>(name: T) => {
    return collectionMap[name];
};

