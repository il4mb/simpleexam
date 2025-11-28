import { useMemo } from 'react';
import { MotionBox } from '../motion';
import { Box, Stack, Typography } from '@mui/material';
import { useRoomManager } from '@/contexts/RoomManager';
import { useParticipants } from '@/hooks/useParticipants';
import { useQuiz } from '@/hooks/useQuiz';
import AvatarCompact from '../avatars/AvatarCompact';
import { getColor } from '@/theme/colors';
import { Check, RadioButtonUnchecked, EmojiEvents } from '@mui/icons-material';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export default function ReadyParticipants() {
    
    const { room } = useRoomManager();
    const { activeParticipants } = useParticipants();
    const { readyUids } = useQuiz();
    
    const filteredParticipants = useMemo(() => 
        activeParticipants.filter(u => u.id !== room.createdBy && readyUids.includes(u.id)), 
        [room, readyUids, activeParticipants]
    );

    const notReadyParticipants = useMemo(() => 
        activeParticipants.filter(u => u.id !== room.createdBy && !readyUids.includes(u.id)), 
        [room, readyUids, activeParticipants]
    );

    const totalParticipants = activeParticipants.filter(u => u.id !== room.createdBy).length;
    const readyCount = filteredParticipants.length;
    const progressPercentage = totalParticipants > 0 ? (readyCount / totalParticipants) * 100 : 0;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                delayChildren: 0.3,
                staggerChildren: 0.1
            }
        }
    };

    const participantVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        },
        ready: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    };

    const checkmarkVariants: Variants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="visible" style={{ width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
                <Typography variant="h6" gutterBottom color="text.primary">
                    Peserta Siap
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {readyCount}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        dari
                    </Typography>
                    <Typography variant="h4" color="text.primary">
                        {totalParticipants}
                    </Typography>
                </Box>
                
                {/* Progress Bar */}
                <Box sx={{ width: '100%', maxWidth: 300, mx: 'auto', mb: 1 }}>
                    <Box sx={{ 
                        width: '100%', 
                        height: 8, 
                        backgroundColor: 'grey.200', 
                        borderRadius: 4,
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            style={{
                                height: '100%',
                                background: `linear-gradient(90deg, ${getColor('primary')[400]}, ${getColor('secondary')[400]})`,
                                borderRadius: 4
                            }}
                        />
                    </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                    {progressPercentage === 100 ? 
                        "Semua peserta sudah siap! 🎉" : 
                        `Menunggu ${totalParticipants - readyCount} peserta lainnya...`
                    }
                </Typography>
            </Box>
            <Stack 
                direction="row" 
                justifyContent="center" 
                alignItems="center"
                flexWrap="wrap" 
                gap={3} 
                px={3}>
                <AnimatePresence>
                    {filteredParticipants.map((u, index) => (
                        <MotionBox
                            key={u.id}
                            variants={participantVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="ready"
                            layout
                            style={{ 
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                            {/* Avatar with Checkmark */}
                            <Box sx={{ position: 'relative' }}>
                                <AvatarCompact
                                    borderColor={getColor('primary')[400]}
                                    borderWidth={3}
                                    seed={u.avatar}
                                    size={80}
                                />
                                
                                {/* Ready Checkmark */}
                                <MotionBox
                                    variants={checkmarkVariants}
                                    initial="hidden"
                                    animate="visible"
                                    style={{
                                        position: 'absolute',
                                        bottom: -4,
                                        right: -4,
                                        backgroundColor: getColor('success')[500],
                                        borderRadius: '50%',
                                        padding: 2
                                    }}>
                                    <Check 
                                        sx={{ 
                                            fontSize: 16, 
                                            color: 'white',
                                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                                        }} 
                                    />
                                </MotionBox>

                                {/* Participant Number */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: -8,
                                        left: -8,
                                        backgroundColor: getColor('primary')[500],
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        boxShadow: 2
                                    }}>
                                    {index + 1}
                                </Box>
                            </Box>

                            {/* Participant Name */}
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    maxWidth: 90,
                                    textAlign: 'center',
                                    mt: 1,
                                    fontWeight: 'medium',
                                    color: 'text.primary'
                                }}>
                                {u.name}
                            </Typography>

                            {/* Ready Status */}
                            <Typography 
                                variant="caption" 
                                color="success.main"
                                sx={{ 
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5
                                }}>
                                <Check sx={{ fontSize: 14 }} />
                                Siap
                            </Typography>
                        </MotionBox>
                    ))}
                </AnimatePresence>

                {/* Not Ready Participants (if any) */}
                {notReadyParticipants.length > 0 && (
                    <Box sx={{ width: '100%', mt: 3 }}>
                        <Typography 
                            variant="subtitle2" 
                            color="text.secondary" 
                            align="center"
                            gutterBottom
                            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <RadioButtonUnchecked sx={{ fontSize: 16 }} />
                            Menunggu ({notReadyParticipants.length})
                        </Typography>
                        
                        <Stack 
                            direction="row" 
                            justifyContent="center" 
                            flexWrap="wrap" 
                            gap={1}>
                            {notReadyParticipants.map((u) => (
                                <MotionBox
                                    key={u.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 0.6, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                    <AvatarCompact
                                        borderColor="grey.400"
                                        borderWidth={2}
                                        seed={u.avatar}
                                        size={50}
                                    />
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            maxWidth: 60,
                                            textAlign: 'center',
                                            mt: 0.5,
                                            color: 'text.secondary'
                                        }}>
                                        {u.name}
                                    </Typography>
                                </MotionBox>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Empty State */}
                {filteredParticipants.length === 0 && (
                    <MotionBox
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            textAlign: 'center',
                            py: 4
                        }}>
                        <EmojiEvents 
                            sx={{ 
                                fontSize: 64, 
                                color: 'grey.400',
                                mb: 2
                            }} 
                        />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Belum ada peserta yang siap
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Tunggu hingga peserta menekan tombol "Siap"
                        </Typography>
                    </MotionBox>
                )}
            </Stack>
        </MotionBox>
    );
}