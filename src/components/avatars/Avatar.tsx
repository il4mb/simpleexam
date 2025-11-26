import { createAvatar } from "@dicebear/core";
import { StyleName, getAvatarCollection, StyleOptions } from "./data";
import { useMemo } from "react";
import { Box } from "@mui/material";

export interface AvaProps<T extends StyleName> {
    style: T;
    options?: Partial<StyleOptions<T>>;
}


export default function Avatar<T extends StyleName>({ style, options }: AvaProps<T>) {

    const collection = useMemo(() => getAvatarCollection(style) as any, [style]);
    const avatar = useMemo(() => {
        return createAvatar(collection, options).toDataUri();
    }, [collection, options]);

    return (
        <Box component={"img"} src={avatar} sx={{ width: options?.size || 100, height: options?.size || 100 }} />
    );
}
