import { Box, Stack } from '@mui/material';
import { StyleName, StyleOptions } from '../../data';
import Avatar from '../../Avatar';
import { useCallback } from 'react';

export interface Props<T extends StyleName> {
    style: T;
    name: keyof StyleOptions<T>;
    value: string;
    property: {
        items: {
            enum: string[];
        }
    };
    onChange?: (value: any) => void;
    options: any
}
export default function GridField({ property, style, name, value, options, onChange }: Props<StyleName>) {

    const { items } = property;

    const handleClick = useCallback((item: string) => () => {
        onChange?.({ [name]: [item] });
    }, [name])

    if (!Array.isArray(items.enum)) return;

    return (
        <Stack spacing={1}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 1
                }}>
                {items.enum.map((item) => (
                    <Stack
                        onClick={handleClick(item)}
                        sx={{
                            background: '#f3e3b0ff',
                            borderRadius: 2,
                            overflow: "hidden",
                            border: "3px solid #888",
                            borderColor: value == item ? "#0084ffff" : "#888",
                            width: 80,
                            height: 80
                        }}>
                        <Avatar style={style} options={{ ...options, [name]: [item], size: 75 }} />
                    </Stack>
                ))}
            </Box>
        </Stack>
    );
}