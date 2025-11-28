'use client'

import { Container, Stack, TextField, Typography, Box } from "@mui/material";
import { Rocket, Timeline, Gamepad, Stars, FlashOn, AcUnit } from "@mui/icons-material";
import { useState } from "react";
import CreateRoom from "@/components/CreateRoom";
import { MotionBox, MotionButton, MotionPaper } from "@/components/motion";
import { useCurrentUser } from "@/contexts/SessionProvider";
import AvatarCompact from "@/components/avatars/AvatarCompact";

export default function Home() {

    const user = useCurrentUser();
    const [examCode, setExamCode] = useState("");
    const [isHovered, setIsHovered] = useState(false);

    const floatingShapes = [
        { icon: <AcUnit />, color: "#FF6B6B", delay: 0 },
        { icon: <Timeline />, color: "#4ECDC4", delay: 0.5 },
        { icon: <Gamepad />, color: "#FFD166", delay: 1 },
        { icon: <Stars />, color: "#6A0572", delay: 1.5 },
        { icon: <FlashOn />, color: "#118AB2", delay: 2 }
    ];

    return (
        <Box>
            {/* Animated Background Particles */}
            {floatingShapes.map((shape, index) => (
                <MotionBox
                    key={index}
                    sx={{
                        position: 'absolute',
                        color: shape.color,
                        fontSize: '2rem',
                        opacity: 0.7
                    }}
                    initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * window.innerHeight,
                        rotate: 0
                    }}
                    animate={{
                        y: [null, -100, 100],
                        x: [null, 50, -50],
                        rotate: 360
                    }}
                    transition={{
                        duration: 8 + index * 2,
                        repeat: Infinity,
                        delay: shape.delay,
                        ease: "easeInOut"
                    }}>
                    {shape.icon}
                </MotionBox>
            ))}

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}>
                    <Stack spacing={4} sx={{ width: '100%', alignItems: 'center' }}>

                        {user && (
                            <Stack justifyContent={"center"} alignItems={"center"} sx={{ position: "absolute", top: 0, right: 0, p: 2 }}>
                                <AvatarCompact seed={user?.avatar} size={60} />
                                <Typography fontSize={18} fontWeight={800}>
                                    {user.name}
                                </Typography>
                            </Stack>
                        )}

                        {/* Animated Header */}
                        <MotionBox
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '3.5rem', md: '5rem' },
                                    fontWeight: 900,
                                    background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4, #FFD166)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    color: 'transparent',
                                    textShadow: '0 0 30px rgba(255,255,255,0.3)',
                                    mb: 2
                                }}>
                                Quezy
                            </Typography>

                            <MotionBox
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}>
                                <Rocket sx={{ fontSize: 60, color: '#FFD166', mb: 2 }} />
                            </MotionBox>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'white',
                                    fontWeight: 300,
                                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                    maxWidth: 600
                                }}>
                                Turn boring exams into epic gaming sessions! 🚀
                            </Typography>
                        </MotionBox>

                        {/* Interactive Main Card */}
                        <MotionPaper
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            onHoverStart={() => setIsHovered(true)}
                            onHoverEnd={() => setIsHovered(false)}
                            sx={{
                                p: { xs: 3, md: 5 },
                                width: '100%',
                                maxWidth: 500,
                                textAlign: 'center',
                                borderRadius: 4,
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(255,255,255,0.2)',
                                boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                            {/* Animated Border */}
                            <MotionBox
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '4px',
                                    background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #FFD166)'
                                }}
                                animate={{
                                    backgroundPosition: ['0%', '200%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />

                            <Stack spacing={4}>
                                {/* Create Exam Button */}


                                <CreateRoom />

                                {/* Join Section */}
                                <MotionBox
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: 'white',
                                            mb: 2,
                                            fontWeight: 600
                                        }}>
                                        Udah Punya Kode? Gas Masuk!
                                    </Typography>

                                    <MotionBox
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            alignItems: 'center'
                                        }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Masukan Kode..."
                                            value={examCode}
                                            onChange={(e) => setExamCode(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    color: 'white',
                                                    borderRadius: 2,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    '& fieldset': {
                                                        borderColor: 'rgba(255,255,255,0.3)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'rgba(255,255,255,0.5)',
                                                    },
                                                }
                                            }}
                                        />
                                        <MotionButton
                                            variant="contained"
                                            sx={{
                                                minWidth: 'auto',
                                                whiteSpace: "nowrap",
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: 2,
                                                background: 'linear-gradient(45deg, #4ECDC4, #118AB2)'
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}>
                                            MELUNCUR! 🎯
                                        </MotionButton>
                                    </MotionBox>
                                </MotionBox>

                                {/* Quick Stats */}
                                <MotionBox
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9 }}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        color: 'white',
                                        textAlign: 'center'
                                    }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            2.1k
                                        </Typography>
                                        <Typography variant="caption">
                                            Playing Now
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            15s
                                        </Typography>
                                        <Typography variant="caption">
                                            Avg. Setup
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            ⭐4.9
                                        </Typography>
                                        <Typography variant="caption">
                                            Rating
                                        </Typography>
                                    </Box>
                                </MotionBox>
                            </Stack>
                        </MotionPaper>

                        {/* Feature Highlights */}
                        <MotionBox
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}
                        >
                            {[
                                "🎮 Game-like Interface",
                                "⚡ Real-time Leaderboards",
                                "🏆 Achievements & Badges",
                                "🚀 Instant Results",
                                "🎯 Smart Analytics"
                            ].map((feature, index) => (
                                <MotionBox
                                    key={index}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        borderRadius: 20,
                                        background: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'white'
                                    }}
                                    whileHover={{
                                        scale: 1.1,
                                        background: 'rgba(255,255,255,0.2)'
                                    }}
                                >
                                    <Typography variant="body2" fontWeight="500">
                                        {feature}
                                    </Typography>
                                </MotionBox>
                            ))}
                        </MotionBox>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}