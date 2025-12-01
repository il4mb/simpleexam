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
                    <Stack gap={4} flexBasis={550}>

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


                        <MotionStack
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            justifyContent={"center"}
                            alignItems={"center"}
                            sx={{ textAlign: 'center', mt: { xs: 15, md: 5 } }}>
                            {/* DESKTOP */}
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '13vw', md: '8rem' },
                                    fontWeight: 900,
                                    color: '#5799fdff',
                                }}>
                                Edu
                                <Typography
                                    component={"span"}
                                    sx={{
                                        fontSize: { xs: '13vw', md: '8rem' },
                                        fontWeight: 900,
                                        color: "#ff5e01ff"
                                    }}>Do
                                </Typography>
                                Exam
                            </Typography>

                            <Typography
                                variant="h5"
                                sx={{
                                    color: 'white',
                                    fontWeight: 300,
                                    textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                    maxWidth: 600,
                                    textAlign: "center",
                                    fontSize: { xs: '2.5vw', md: '1rem' },
                                }}>
                                Turn boring exams into epic gaming sessions! 🚀
                            </Typography>
                        </MotionStack>

                        <MotionStack
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            sx={{ p: { xs: 3, sm: 10 }, flex: 1, }}>

                            <Stack spacing={4} flex={1}>
                                <CreateRoom />
                                <MotionBox
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                    sx={{ flex: 1, }}>
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
                                            flexWrap: { xs: "wrap", sm: "nowrap" },
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
                                            onClick={handleNavigate}
                                            sx={{
                                                minWidth: 'auto',
                                                whiteSpace: "nowrap",
                                                px: 3,
                                                py: 1.2,
                                                borderRadius: 2,
                                                ml: 'auto'
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

                        </MotionStack>
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