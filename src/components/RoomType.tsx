import { ReactNode, useState } from 'react';
import {
    Box,
    Paper,
    Stack,
    Typography,
    Card,
    CardContent,
    Chip,
    Button,
    Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    DrawRounded,
    QuizRounded,
    Groups,
    Timer} from '@mui/icons-material';

const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

export type RoomType = "draw" | "quiz";

const ROOM_TYPES = [
    {
        type: "draw" as RoomType,
        name: "Drawing Room",
        description: "Collaborative drawing and guessing game",
        icon: <DrawRounded sx={{ fontSize: 40 }} />,
        color: "#FF6B6B",
        gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        features: [
            "Real-time drawing canvas",
            "Word guessing game",
            "Multiple drawing tools",
            "Color palette",
            "Turn-based gameplay"
        ],
        participants: "2-8 players",
        duration: "2-5 minutes per round"
    },
    {
        type: "quiz" as RoomType,
        name: "Quiz Room",
        description: "Interactive trivia and knowledge challenges",
        icon: <QuizRounded sx={{ fontSize: 40 }} />,
        color: "#4ECDC4",
        gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
        features: [
            "Multiple question types",
            "Live leaderboard",
            "Timer-based challenges",
            "Points system",
            "Custom questions"
        ],
        participants: "2-20 players",
        duration: "10-30 minutes"
    }
];

export interface RoomTypeProps {
    value?: RoomType;
    onChange?: (type: RoomType) => void;
    children?: ReactNode;
}

export default function RoomType({ value, onChange, children }: RoomTypeProps) {
    const [selectedType, setSelectedType] = useState<RoomType | undefined>(value);

    const handleTypeChange = (newType: RoomType) => {
        setSelectedType(newType);
        onChange?.(newType);
    };

    return (
        <Box sx={{ py: 4 }}>
            <Container maxWidth="lg">
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                        p: 4,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {/* Header */}
                    <Stack spacing={2} sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            fontWeight="bold"
                            sx={{
                                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                color: 'transparent'
                            }}
                        >
                            Choose Room Type
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                            Select the type of room you want to create
                        </Typography>
                    </Stack>

                    {/* Room Type Cards */}
                    <Grid container spacing={3} justifyContent="center">
                        {ROOM_TYPES.map((roomType, index) => (
                            <Grid size={{ xs: 12, md: 6 }} key={roomType.type}>
                                <MotionCard
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    sx={{
                                        cursor: 'pointer',
                                        border: selectedType === roomType.type ?
                                            `3px solid ${roomType.color}` :
                                            '2px solid transparent',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 10px 30px ${roomType.color}40`
                                        }
                                    }}
                                    onClick={() => handleTypeChange(roomType.type)}>
                                    {/* Header with Gradient */}
                                    <Box
                                        sx={{
                                            background: roomType.gradient,
                                            p: 3,
                                            color: 'white',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <Stack spacing={2} alignItems="center">
                                            {roomType.icon}
                                            <Typography variant="h5" fontWeight="bold">
                                                {roomType.name}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                                {roomType.description}
                                            </Typography>
                                        </Stack>
                                    </Box>

                                    <CardContent>
                                        <Stack spacing={3}>
                                            {/* Features */}
                                            <Box>
                                                <Typography variant="h6" gutterBottom fontWeight="600">
                                                    Features
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {roomType.features.map((feature, featureIndex) => (
                                                        <Box
                                                            key={featureIndex}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 1
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    width: 8,
                                                                    height: 8,
                                                                    borderRadius: '50%',
                                                                    background: roomType.color
                                                                }}
                                                            />
                                                            <Typography variant="body2" color="text.secondary">
                                                                {feature}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            </Box>

                                            {/* Room Info */}
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                justifyContent="space-between"
                                                sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}
                                            >
                                                <Stack spacing={1} alignItems="center">
                                                    <Groups sx={{ color: roomType.color, fontSize: 20 }} />
                                                    <Typography variant="caption" fontWeight="500">
                                                        {roomType.participants}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Players
                                                    </Typography>
                                                </Stack>

                                                <Stack spacing={1} alignItems="center">
                                                    <Timer sx={{ color: roomType.color, fontSize: 20 }} />
                                                    <Typography variant="caption" fontWeight="500">
                                                        {roomType.duration}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Duration
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            {/* Selection Indicator */}
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Chip
                                                    label={selectedType === roomType.type ? "Selected" : "Select"}
                                                    color={selectedType === roomType.type ? "primary" : "default"}
                                                    variant={selectedType === roomType.type ? "filled" : "outlined"}
                                                    sx={{
                                                        background: selectedType === roomType.type ? roomType.gradient : 'transparent',
                                                        color: selectedType === roomType.type ? 'white' : 'inherit'
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Selected Type Display */}
                    {selectedType && (
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            sx={{
                                mt: 4,
                                p: 3,
                                borderRadius: 3,
                                background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                                border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}
                        >
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Stack spacing={1}>
                                    <Typography variant="h6" fontWeight="600">
                                        {ROOM_TYPES.find(t => t.type === selectedType)?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Ready to create your {selectedType === 'draw' ? 'drawing' : 'quiz'} room
                                    </Typography>
                                </Stack>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        background: ROOM_TYPES.find(t => t.type === selectedType)?.gradient,
                                        borderRadius: 2,
                                        px: 4
                                    }}
                                >
                                    Continue
                                </Button>
                            </Stack>
                        </MotionPaper>
                    )}

                    {children}
                </MotionPaper>
            </Container>
        </Box>
    );
}

// Container component for layout
const Container = ({ children, maxWidth = "lg" }: { children: ReactNode; maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" }) => (
    <Box sx={{ width: '100%', maxWidth: { [maxWidth]: 1200 }, mx: 'auto', px: 2 }}>
        {children}
    </Box>
);