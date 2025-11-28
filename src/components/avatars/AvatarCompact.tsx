import { adventurer } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Avatar, SxProps } from '@mui/material';
import { useMemo } from 'react';

export interface AvatarCompactProps {
    seed?: string;
    alt?: string;
    size?: number;
    borderColor?: string | false;
    borderWidth?: number | false;
    sx?: SxProps;
}

export default function AvatarCompact({
    seed = 'default',
    alt = 'User Avatar',
    size = 100,
    borderColor = "currentColor",
    borderWidth = 3,
    sx
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
                borderWidth: borderWidth || 3,
                width: size, height: size,
                borderColor: borderColor ? borderColor : "currentColor",
                ...(sx|| {}) as any,
                ...theme.applyStyles("dark", {
                    background: "#161a1fff",
                }),
            })} />
    );
}