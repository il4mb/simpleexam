'use client'

import { RoomData } from '@/types';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { HourglassEmpty, Person } from '@mui/icons-material';

export interface PerndingJointProps {
    pendingCount: number;
    room: RoomData;
}
export default function PerndingJoint({ pendingCount, room }: PerndingJointProps) {
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    {/* Animated Icon */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            mb: 3
                        }}>
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'inline-flex'
                            }}>
                            <CircularProgress
                                size={80}
                                thickness={2}
                                sx={{
                                    color: 'primary.main',
                                    animation: 'pulse 2s infinite'
                                }}
                            />
                            <Box
                                sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <HourglassEmpty
                                    sx={{
                                        fontSize: 40,
                                        color: 'primary.main'
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2
                        }}>
                        Menunggu Persetujuan
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        paragraph
                        sx={{ mb: 3, lineHeight: 1.6 }}>
                        Permintaan Anda untuk bergabung ke room <strong>"{room.name}"</strong> sedang menunggu persetujuan dari host.
                    </Typography>

                    {/* Room Info */}
                    <Card
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            backgroundColor: 'action.hover'
                        }}>
                        <CardContent sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                <Person color="primary" />
                                <Typography variant="body2" fontWeight="medium">
                                    {pendingCount} peserta menunggu persetujuan
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Additional Info */}
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'block',
                            fontStyle: 'italic'
                        }}>
                        Host akan segera meninjau permintaan Anda. Silakan tunggu...
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}