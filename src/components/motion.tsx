import { Box, Button, Dialog, IconButton, Paper, Stack } from "@mui/material";
import { motion, Variants } from "motion/react";

export const MotionDialog = motion.create(Dialog);
export const MotionPaper = motion.create(Paper);
export const MotionButton = motion.create(Button);
export const MotionIconButton = motion.create(IconButton);
export const MotionBox = motion.create(Box);
export const MotionStack = motion.create(Stack);


export const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.2
        }
    }
};

export const itemVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
};

export const pulseVariants: Variants = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

export const floatingVariants: Variants = {
    float: {
        y: [0, -10, 0],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};