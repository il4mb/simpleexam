import { adventurer } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { Shuffle } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const randomString = () => `${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 10)}`;
export interface AvatarEditorCompactProps {
    seed?: string;
    onChange?: (seed: string) => void;

}
export default function AvatarEditorCompact({ seed: externalSeed, onChange }: AvatarEditorCompactProps) {

    const ignoreRef = useRef(false);
    const [seed, setSeed] = useState(randomString);

    const avatar = useMemo(() => {
        return createAvatar(adventurer, { seed }).toDataUri();
    }, [seed]);

    const randomize = useCallback(() => {
        setSeed(randomString());
    }, [onChange]);

    useEffect(() => {
        ignoreRef.current = true;
        onChange?.(seed);
    }, [seed, onChange]);

    useEffect(() => {
        if (!externalSeed) return;
        if (ignoreRef.current) {
            ignoreRef.current = false;
            return;
        }
        setSeed(externalSeed);
    }, [externalSeed]);

    return (
        <Stack justifyContent={"center"} alignItems={"center"}>
            <Box component={"img"} src={avatar} sx={{ width: 150, height: 150, pointerEvents: 'none' }} />
            <Button startIcon={<Shuffle />} onClick={randomize} size={'small'}>Acak</Button>
        </Stack>
    );
}