'use client'

import { Container, Stack, TextField, Typography, Box } from "@mui/material";
import { useState } from "react";
import CreateRoom from "@/components/CreateRoom";
import { MotionBox, MotionButton, MotionStack } from "@/components/motion";
import { useCurrentUser } from "@/contexts/SessionProvider";
import AvatarCompact from "@/components/avatars/AvatarCompact";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/navigation";
import EditProfileDialog from "@/components/EditProfileDialog";

export default function Home() {

    const router = useRouter();
    const user = useCurrentUser();
    const [examCode, setExamCode] = useState("");

    const handleNavigate = () => {
        if (examCode.length < 6) {
            return enqueueSnackbar("Kode tidak valid!", { variant: "error" });
        }
        router.push(`/quiz/${examCode}`);
    }

    return (
        <Box>
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
                            <EditProfileDialog
                                handler={
                                    <MotionStack
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        sx={{ position: "absolute", top: 0, right: 0, p: 2 }}>
                                        <MotionBox whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.1 }}>
                                            <AvatarCompact seed={user?.avatar} size={60} />
                                        </MotionBox>
                                        <Typography fontSize={18} fontWeight={800}>
                                            {user.name}
                                        </Typography>
                                    </MotionStack>
                                } />
                        )}

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
                                    mb: 2
                                }}>
                                EduDo
                                <Typography
                                    component={"span"}
                                    sx={{
                                        fontSize: { xs: '3.5rem', md: '5rem' },
                                        fontWeight: 900,
                                        textDecoration: "line-through",
                                        textDecorationColor: "#9c1717ff"
                                    }}>Exam
                                </Typography> | Quiz
                            </Typography>

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
                        <MotionBox
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            sx={{ p: 10 }}>

                            <Stack spacing={4}>
                                <CreateRoom />
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
                                            alignItems: 'center',
                                            flexWrap:  "wrap"
                                        }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Masukan Kode..."
                                            value={examCode}
                                            onChange={(e) => setExamCode(e.target.value)}
                                            sx={{
                                                flexBasis: 200,
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
                                            onClick={handleNavigate}
                                            sx={{
                                                minWidth: 'auto',
                                                whiteSpace: "nowrap",
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: 2,
                                                // background: 'linear-gradient(45deg, #4ECDC4, #118AB2)'
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

                        </MotionBox>
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