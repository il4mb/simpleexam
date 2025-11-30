import { collectionMapNamed, StyleName } from './data';
import { Stack } from '@mui/material';
import Avatar from './Avatar';

export interface StyleListProps {
    style: StyleName;
    onChange: (name: StyleName) => void;
}
export default function StyleList({ style, onChange }: StyleListProps) {

    return (
        <Stack
            gap={2}
            direction={"row"}
            flexWrap={"wrap"}
            justifyContent={"start"}
            alignItems={"start"}>

            {Object.keys(collectionMapNamed).map((key, i) => (
                <Stack
                    key={i}
                    onClick={() => onChange(key as any)}
                    sx={{
                        background: '#f3e3b0ff',
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "3px solid #888",
                        borderColor: key == style ? "#0084ffff" : "#888"
                    }}
                    justifyContent={"center"}
                    alignItems={"center"}>
                    <Avatar style={key as any} options={{ size: 75 }} />
                </Stack>
            ))}
        </Stack>
    );
}