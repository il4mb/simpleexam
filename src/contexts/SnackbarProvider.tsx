'use client'
import { CloseRounded } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { closeSnackbar, SnackbarProvider as NotiStackSnackbar } from 'notistack'
import { ReactNode } from 'react';

export interface SnackbarProviderProps {
    children?: ReactNode;
}
export default function SnackbarProvider({ children }: SnackbarProviderProps) {
    return (
        <NotiStackSnackbar
            maxSnack={3}
            anchorOrigin={{
                vertical: "top",
                horizontal: "center"
            }}
            action={SnackbarAction}>
            {children}
        </NotiStackSnackbar>
    );
}


const SnackbarAction = (id: string | number) => {

    const handleClose = () => {
        closeSnackbar(id);
    }

    return (
        <IconButton onClick={handleClose}>
            <CloseRounded />
        </IconButton>
    )
}