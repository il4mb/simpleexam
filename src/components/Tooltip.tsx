import { Tooltip as MuiTooltip, TooltipProps } from "@mui/material";

export default function Tooltip({ children, title, ...props }: TooltipProps) {
    return (
        <MuiTooltip
            title={title}
            arrow
            {...props}
            slotProps={{
                ...props.slotProps,
                popper: {
                    ...props.slotProps?.popper,
                    modifiers: [
                        ...((props.slotProps?.popper as any)?.modifiers || []) as any,
                        {
                            name: "pointerEvents",
                            enabled: true,
                            phase: "afterWrite",
                            fn: ({ state }) => {
                                if (state.elements.popper) {
                                    state.elements.popper.style.pointerEvents = "none";
                                }
                            },
                        },
                    ],
                },
                tooltip: {
                    ...props.slotProps?.tooltip,
                    sx: {
                        fontSize: "0.7em",
                        padding: "2px 6px",
                        pointerEvents: "none",
                        ...(props.slotProps?.tooltip as any)?.sx
                    },
                }
            }}>
            {children}
        </MuiTooltip>
    );
}