import { Box, Popover, Stack, TextField, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import AvatarEditorCompact from './avatars/AvatarEditorCompact';
import { ArrowForward } from '@mui/icons-material';
import { useSession } from '@/contexts/SessionProvider';
import { MotionBox, MotionButton } from './motion';

export interface EditProfileDialogProps {
    handler: ReactNode;
}
export default function EditProfileDialog({ handler }: EditProfileDialogProps) {

    const { user, updateUser } = useSession();
    const [avatar, setAvatar] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const open = Boolean(anchorEl);

    // Initialize with current user data when dialog opens
    useEffect(() => {
        if (user) {
            setAvatar(user.avatar);
            setName(user.name);
            setError('');
        }
    }, [user]);

    // Check if values are different from current user
    const isFormChanged = useCallback(() => {
        if (!user) return false;
        const nameChanged = name.trim() !== user.name?.trim();
        const avatarChanged = avatar.trim() !== user.avatar?.trim();
        return nameChanged || avatarChanged;
    }, [name, avatar, user]);

    const isFormValid = useCallback(() => {
        if (!name.trim()) return false;
        if (name.trim().length < 2) return false;
        if (name.trim().length > 20) return false;
        if (!avatar?.trim()) return false;
        if (!isFormChanged()) return false;

        return true;
    }, [name, avatar, isFormChanged]);

    const handleOpen = useCallback((e: any) => {
        setAnchorEl(e.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
        // Reset to original values on close
        if (user) {
            setAvatar(user.avatar || '');
            setName(user.name || '');
        }
        setError('');
    }, [user]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) return setError("Nama tidak boleh kosong");
        if (name.trim().length < 2) return setError("Nama minimal 2 karakter");
        if (name.trim().length > 18) return setError("Nama maksimal 20 karakter");
        if (!avatar?.trim()) return setError("Avatar tidak boleh kosong");

        if (!isFormChanged()) {
            enqueueSnackbar("Tidak ada perubahan yang perlu disimpan", { variant: "info" });
            handleClose();
            return;
        }

        setIsSubmitting(true);
        await updateUser({ avatar, name });
        setError('');
        enqueueSnackbar("Profil berhasil diperbarui", { variant: "success" });
        setTimeout(() => setIsSubmitting(false), 100);
    }, [avatar, name, user?.id, isFormChanged, handleClose]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isFormValid() && !isSubmitting) {
            handleSubmit(e);
        }
    }, [isFormValid, isSubmitting, handleSubmit]);

    return (
        <>
            {React.cloneElement(handler as any, { onClick: handleOpen })}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}>
                <Box p={3} width={300}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <AvatarEditorCompact
                                seed={avatar}
                                onChange={setAvatar}
                            />
                            <MotionBox initial={{ y: -100 }} animate={{ y: 0 }}>
                                <TextField
                                    label="Nama Kamu"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setError('');
                                    }}
                                    onKeyUp={handleKeyPress}
                                    error={!!error}
                                    helperText={error}
                                    fullWidth
                                    autoFocus
                                    disabled={isSubmitting}
                                    placeholder="Masukkan nama anda"
                                />
                                <Typography fontSize={10} color={name.length > 18 ? 'error.main' : 'text.secondary'}>
                                    {name.length}/18
                                </Typography>
                            </MotionBox>

                            <MotionButton
                                initial={{ y: -100 }}
                                animate={{ y: 0 }}
                                type="submit"
                                variant="contained"
                                endIcon={<ArrowForward />}
                                disabled={!isFormValid() || isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' :
                                    isFormChanged() ? 'Simpan Perubahan' : 'Tidak Ada Perubahan'}
                            </MotionButton>
                        </Stack>
                    </form>
                </Box>
            </Popover>
        </>
    );
}