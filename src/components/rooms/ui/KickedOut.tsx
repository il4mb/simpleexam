import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Block, ArrowBack } from '@mui/icons-material';
import { RoomData } from '@/types';

export interface KickedOutProps {
    room: RoomData;
}
export default function KickedOut({ room }: KickedOutProps) {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                p: 3
            }}>
            <Card
                sx={{
                    maxWidth: 500,
                    width: '100%',
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                <CardContent sx={{ p: 4 }}>
                    {/* Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3
                        }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                bgcolor: 'error.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                            <Block
                                sx={{
                                    fontSize: 40,
                                    color: 'error.main'
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                        color="error.main"
                        sx={{ mb: 2 }}>
                        Akses Ditolak
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                        sx={{ mb: 3, lineHeight: 1.6 }}>
                        Anda telah dikeluarkan dari room <strong>"{room.name}"</strong> oleh host.
                    </Typography>

                    {/* Reason (if available) */}
                    <Card
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            backgroundColor: 'error.light',
                            borderColor: 'error.main'
                        }}>
                        <CardContent sx={{ py: 2 }}>
                            <Typography variant="body2" color="error.dark" fontWeight="medium">
                                🚫 Anda tidak memiliki akses ke room ini lagi
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            startIcon={<ArrowBack />}
                            onClick={() => window.location.href = '/'}
                            sx={{
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}>
                            Kembali ke Beranda
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => window.location.reload()}
                            sx={{
                                borderColor: 'primary.main',
                                color: 'primary.main'
                            }}>
                            Coba Lagi
                        </Button>
                    </Box>

                    {/* Additional Info */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'block',
                            mt: 3,
                            fontStyle: 'italic'
                        }}>
                        Jika Anda merasa ini adalah kesalahan, hubungi host room.
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}