import {
    Box,
    Card,
    CardContent,
    Typography,
    Stack,
    Chip,
    Alert,
    LinearProgress,
} from '@mui/material';
import {
    AccessTime,
    HelpOutline,
    PlaylistAddCheck,
    Person,
} from '@mui/icons-material';
import { MotionBox, MotionStack } from '@/components/motion';
import { useQuestions } from '@/contexts/QuestionsProvider';
import QuestionPreviewCard from '@/components/questions/QuestionPreviewCard';
import { useRoomManager } from '@/contexts/RoomManager';
import { useMemo } from 'react';
import AvatarCompact from '@/components/avatars/AvatarCompact';
import Tooltip from '@/components/Tooltip';
import { useParticipants } from '@/hooks/useParticipants';

export interface QuestionsPreviewProps {

}

export default function QuestionsPreview({ }: QuestionsPreviewProps) {

    const { questions } = useQuestions();
    const { room } = useRoomManager();
    const { participants } = useParticipants();
    const hostUser = useMemo(() => participants.find(client => client.id == room.createdBy), [room, participants]);

    const totalDuration = questions.reduce((total, q) => total + q.duration, 0);
    const totalOptions = questions.reduce((total, q) => total + q.options.length, 0);

    if (questions.length === 0) {
        return (
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="body1" fontWeight="500" flex={1}>
                            Belum ada soal. {hostUser ? `${hostUser.name} sedang menyiapkan kuis...` : "Host sedang menyiapkan kuis..."}
                        </Typography>
                        {hostUser && (
                            <Tooltip title={`Host: ${hostUser.name}`}>
                                <Box>
                                    <AvatarCompact seed={hostUser.avatar} size={40} />
                                </Box>
                            </Tooltip>
                        )}
                    </Stack>
                </Alert>
            </MotionBox>
        );
    }

    return (
        <MotionStack spacing={3}>
            {/* Quiz Overview */}
            <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>
                <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default', border: '2px dashed' }}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography variant="h5" fontWeight="bold">
                                    Preview Kuis
                                </Typography>
                                {hostUser && (
                                    <Chip
                                        icon={<Person />}
                                        label={`Host: ${hostUser.name}`}
                                        variant="outlined"
                                        size="small"
                                        avatar={<AvatarCompact seed={hostUser.avatar} size={24} />}
                                    />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                                <Chip
                                    icon={<HelpOutline />}
                                    label={`${questions.length} Soal`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<AccessTime />}
                                    label={`${Math.round(totalDuration / 60)} menit`}
                                    color="secondary"
                                    variant="outlined"
                                />
                                <Chip
                                    icon={<PlaylistAddCheck />}
                                    label={`${totalOptions} Opsi`}
                                    color="info"
                                    variant="outlined"
                                />
                            </Stack>

                            <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Status: <strong>Menunggu untuk dimulai</strong>
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={0}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'action.hover',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: 'text.disabled',
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </MotionBox>

            {/* Questions List */}
            <MotionStack spacing={2}>
                {questions.map((question, index) => (
                    <MotionBox
                        key={question.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}>
                        <QuestionPreviewCard
                            question={question}
                            index={index}
                            totalQuestions={questions.length}
                        />
                    </MotionBox>
                ))}
            </MotionStack>
        </MotionStack>
    );
}