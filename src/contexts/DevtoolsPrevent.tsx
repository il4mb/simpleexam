'use client'

import { Backdrop, Box, Fade, Typography } from '@mui/material';
import { ReactNode, useEffect, useState, useRef } from 'react';

export interface DevtoolsPreventProps {
    children?: ReactNode;
}

export default function DevtoolsPrevent({ children }: DevtoolsPreventProps) {
    const [devToolsOpen, setDevToolsOpen] = useState(false);
    const detectionCount = useRef(0);
    const lastDetectionTime = useRef(0);
    const falsePositiveCount = useRef(0);
    const shouldPrevent = devToolsOpen;

    useEffect(() => {
        let checkInterval: NodeJS.Timeout;
        let isActuallyOpen = false;

        const setStableDevToolsOpen = (open: boolean) => {
            const now = Date.now();
            
            if (open) {
                detectionCount.current++;
                lastDetectionTime.current = now;
                
                // Require multiple detections within short time to confirm
                if (detectionCount.current >= 2 && now - lastDetectionTime.current < 2000) {
                    if (!isActuallyOpen) {
                        isActuallyOpen = true;
                        setDevToolsOpen(true);
                    }
                }
            } else {
                // Reset counter if no detection for a while
                if (now - lastDetectionTime.current > 3000) {
                    detectionCount.current = 0;
                    if (isActuallyOpen) {
                        isActuallyOpen = false;
                        setDevToolsOpen(false);
                    }
                }
            }
        };

        const detectDevTools = () => {
            let consecutiveDetections = 0;
            
            checkInterval = setInterval(() => {
                // Method 1: Window size difference - most reliable
                const heightDiff = window.outerHeight - window.innerHeight;
                const widthDiff = window.outerWidth - window.innerWidth;
                
                // More conservative thresholds to reduce false positives
                const sizeDetected = heightDiff > 150 || widthDiff > 150;
                
                // Method 2: Check if window is significantly smaller than screen
                const screenWidth = window.screen.availWidth;
                const screenHeight = window.screen.availHeight;
                const smallWindowDetected = window.outerWidth < screenWidth - 200 || window.outerHeight < screenHeight - 200;

                const detected = sizeDetected || smallWindowDetected;
                
                if (detected) {
                    consecutiveDetections++;
                    // Require consecutive detections to confirm
                    if (consecutiveDetections >= 3) {
                        setStableDevToolsOpen(true);
                    }
                } else {
                    consecutiveDetections = 0;
                    setStableDevToolsOpen(false);
                }
            }, 1000);
        };

        // Alternative methods - only run occasionally and don't trigger immediately
        const runAlternativeChecks = () => {
            try {
                // Debugger check - only count if consistently slow
                const start = Date.now();
                debugger;
                const debuggerTime = Date.now() - start;
                if (debuggerTime > 100) {
                    setStableDevToolsOpen(true);
                }

                // Console check - less aggressive
                let consoleTriggered = false;
                const element = new Image();
                Object.defineProperty(element, 'id', {
                    get: function () {
                        if (!consoleTriggered) {
                            consoleTriggered = true;
                            setTimeout(() => setStableDevToolsOpen(true), 100);
                        }
                        return true;
                    }
                });
                
                // Use setTimeout to avoid immediate execution
                setTimeout(() => {
                    console.log(element);
                    console.clear();
                }, 100);

            } catch (error) {
                // Silence errors
            }
        };

        detectDevTools();

        // Run alternative checks less frequently
        const altCheckInterval = setInterval(runAlternativeChecks, 15000);

        // Keyboard shortcut prevention - only prevent, don't detect
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.metaKey && e.altKey && e.key === 'I')) {
                e.preventDefault();
                setStableDevToolsOpen(true);
                return false;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(checkInterval);
            clearInterval(altCheckInterval);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Simple visibility change handler without aggressive detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            // Only act if we're already in a detected state
            if (devToolsOpen && document.hidden) {
                // User switched tabs while devtools were open - maintain state
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [devToolsOpen]);

    if (shouldPrevent) {
        return (
            <Backdrop
                open={true}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    color: 'white',
                    zIndex: 9999,
                    flexDirection: 'column',
                    gap: 3,
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Fade in={true} timeout={500}>
                    <Box textAlign="center" sx={{ maxWidth: 450, px: 3 }}>
                        <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">
                            🚫 Security Restriction
                        </Typography>
                        <Typography variant="h6" gutterBottom color="warning.main">
                            Developer Tools Detected
                        </Typography>
                        <Typography variant="body1" paragraph sx={{ lineHeight: 1.6 }}>
                            Please close developer tools to continue with the quiz.
                        </Typography>
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                How to close dev tools:
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                                • Press <strong>F12</strong>
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                                • Or close the developer tools panel manually
                            </Typography>
                        </Box>
                    </Box>
                </Fade>
            </Backdrop>
        );
    }

    return <>{children}</>;
}