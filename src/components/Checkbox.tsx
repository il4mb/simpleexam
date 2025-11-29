import { Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionBox } from './motion';
import { CheckBoxOutlineBlank, CheckBoxOutlined } from '@mui/icons-material';
import { getColor } from '@/theme/colors';

export interface CheckboxProps {
    label?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

export default function Checkbox({ label, checked, onChange }: CheckboxProps) {
    const isExternalUpdate = useRef(false);

    // mirror props → state (controlled or uncontrolled)
    const [localChecked, setLocalChecked] = useState(checked ?? false);

    const handleChanged = useCallback(() => {
        const newValue = !localChecked;

        // controlled
        if (onChange) {
            onChange(newValue);
        }

        // always update local for instant UI response
        isExternalUpdate.current = true;
        setLocalChecked(newValue);

    }, [localChecked, onChange]);

    // props → state sync
    useEffect(() => {
        if (isExternalUpdate.current) {
            // skip because this came from inside
            isExternalUpdate.current = false;
            return;
        }
        setLocalChecked(checked ?? false);
    }, [checked]);

    return (
        <Stack
            direction={"row"}
            alignItems={"center"}
            spacing={1}
            onClick={handleChanged}
            sx={{ cursor: "pointer", color: getColor(localChecked ? "primary" : "secondary")[400], userSelect: "none" }}>
            <MotionBox color={localChecked ? "primary" : "secondary"}>
                {localChecked ? <CheckBoxOutlined /> : <CheckBoxOutlineBlank />}
            </MotionBox>
            <Typography>{label}</Typography>
        </Stack>
    );
}
