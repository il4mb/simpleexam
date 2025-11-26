import { adventurer } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Avatar, Box } from '@mui/material';
import { ReactNode, useMemo, useState } from 'react';

export interface AvatarCompactProps {
    seed?: string;
    alt?: string;
    size?: number;
    borderColor?: string | false;
}

export default function AvatarCompact({
    seed = 'default',
    alt = 'User Avatar',
    size = 100,
    borderColor = "currentColor"
}: AvatarCompactProps) {

    const avatar = useMemo(() => {
        return createAvatar(adventurer, {
            seed,
            size: size * 2
        }).toDataUri();
    }, [seed, size]);

    return (
        <Avatar
            src={avatar}
            alt={alt}
            sx={(theme) => ({
                background: "#adaee7ff",
                border: '3px solid',
                width: size, height: size,
                borderColor: borderColor ? borderColor : "currentColor",
                ...theme.applyStyles("dark", {
                    background: "#161a1fff",
                })
            })} />
    );
}