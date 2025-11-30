// FloatingCamera.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, CircularProgress, IconButton, Stack, Typography, Tooltip, Paper } from '@mui/material';
import { Remove, Videocam, VideocamOff } from '@mui/icons-material';
import * as faceapi from 'face-api.js';
import { MotionBox, MotionStack } from './motion'; // Assuming these are your custom wrappers

export interface FloatingCameraProps {
    onExpressionDetected?: (expression: string, probability: number) => void;
    onFaceDetected?: (isDetected: boolean) => void;
    onReady?: () => void;
    initialPosition?: { x: number; y: number };
}

// Map expressions to Emojis and Colors
export const EXPRESSION_MAP: Record<string, { emoji: string; color: string; label: string }> = {
    happy: { emoji: '😊', color: '#4caf50', label: 'Happy' },
    sad: { emoji: '😢', color: '#2196f3', label: 'Sad' },
    angry: { emoji: '😠', color: '#f44336', label: 'Angry' },
    fearful: { emoji: '😨', color: '#9c27b0', label: 'Fearful' },
    disgusted: { emoji: '🤢', color: '#795548', label: 'Disgusted' },
    surprised: { emoji: '😲', color: '#ff9800', label: 'Surprised' },
    neutral: { emoji: '😐', color: '#9e9e9e', label: 'Neutral' },
};

export default function FloatingCamera({
    onExpressionDetected,
    onFaceDetected,
    onReady,
    initialPosition = { x: window.innerWidth - 100, y: window.innerHeight - 100 }
}: FloatingCameraProps) {
    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const constraintsRef = useRef<HTMLDivElement>(null);

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detectedExpression, setDetectedExpression] = useState<string>('');
    const [isHide, setIsHide] = useState(false);

    // Config
    const DETECTION_INTERVAL_MS = 200;

    // 1. Load Models & Start Camera
    useEffect(() => {
        const init = async () => {
            try {
                const MODEL_URL = '/models';
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
                ]);

                await startCamera();
            } catch (err) {
                console.error("Initialization failed:", err);
                setError("Failed to load AI models.");
                setIsLoading(false);
            }
        };

        init();

        return () => stopCamera();
    }, []);

    // 2. Camera Logic
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user"
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Wait for video to be ready before starting detection
                videoRef.current.onloadeddata = () => {
                    setIsLoading(false);
                    startDetectionLoop();
                };
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access denied.");
            setIsLoading(false);
        } finally {
            onReady?.();
        }
    };

    const stopCamera = useCallback(() => {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    // 3. Detection Logic (Throttled)
    const startDetectionLoop = useCallback(() => {
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

        detectionIntervalRef.current = setInterval(async () => {
            if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

            // Simple option is lighter on CPU than SsdMobilenetv1, but less accurate. 
            // Stick to SsdMobilenetv1 if accuracy is key, or switch to TinyFaceDetector for speed.
            const detection = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceExpressions();

            if (detection) {
                const { expressions } = detection;

                // Find dominant expression
                const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
                const [topExpression, probability] = sorted[0];

                if (probability > 0.5) {
                    setDetectedExpression(topExpression);
                    onExpressionDetected?.(topExpression, probability);
                }

                onFaceDetected?.(true);
            } else {
                onFaceDetected?.(false);
                setDetectedExpression(''); // Clear if lost face
            }
        }, DETECTION_INTERVAL_MS);
    }, [onExpressionDetected, onFaceDetected]);


    const toggleVisibility = useCallback(() => setIsHide(prev => !prev), []);

    // 4. UI Helpers
    const currentEmoji = detectedExpression ? EXPRESSION_MAP[detectedExpression]?.emoji : '';
    const borderColor = error ? "#f00" : detectedExpression ? EXPRESSION_MAP[detectedExpression]?.color : 'white';

    return (
        <MotionBox
            ref={constraintsRef}
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 1300,
                pointerEvents: 'none',
                opacity: 0.4,
                "&:hover": {
                    opacity: 1
                }
            }}>
            <MotionStack
                drag
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                dragMomentum={false}
                initial={initialPosition}
                sx={{
                    width: isHide ? 40 : 100,
                    height: isHide ? 40 : 100,
                    pointerEvents: "auto",
                    position: 'relative',
                    cursor: 'grab'
                }}>
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        border: `4px solid ${borderColor}`,
                        transition: 'border-color 0.3s ease',
                        bgcolor: 'black',
                    }}>
                    <Box
                        component="video"
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            opacity: isLoading || isHide ? 0 : 1,
                            transition: 'opacity 0.5s ease',
                        }}
                    />

                    {!isHide ? (
                        <>
                            {isLoading && !error && (
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: '#121212',
                                        color: 'white'
                                    }}>
                                    <CircularProgress color="inherit" size={"small"} sx={{ width: 15, height: 15 }} />
                                    <Typography variant="caption" sx={{ mt: 1, fontSize: 9 }}>Starting AI...</Typography>
                                </Stack>
                            )}
                            {error && (
                                <Stack
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: '#2c0b0e',
                                        color: '#ff8a80',
                                        p: 2,
                                        textAlign: 'center'
                                    }}>
                                    <VideocamOff sx={{ width: 20, height: 20 }} />
                                    <Typography variant="caption" sx={{ mt: 1, fontSize: 9 }}>{error}</Typography>
                                </Stack>
                            )}
                            {detectedExpression && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 8,
                                        right: 8,
                                        textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
                                        fontSize: '1rem',
                                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}>
                                    {currentEmoji}
                                </Box>
                            )}
                            <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                                <Tooltip title={"Sembunyikan"} arrow sx={{ border: "none" }}>
                                    <IconButton size='small' onClick={toggleVisibility}>
                                        <Remove />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </>
                    ) : (
                        <Stack
                            justifyContent={"center"}
                            alignItems={"center"}
                            onClick={toggleVisibility}
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                cursor: "pointer",
                                color: borderColor
                            }}>
                            {isLoading && !error ? (<CircularProgress size={"small"} />) : error ? <VideocamOff /> : <Videocam />}
                        </Stack>
                    )}
                </Paper>
            </MotionStack>
        </MotionBox>
    );
}