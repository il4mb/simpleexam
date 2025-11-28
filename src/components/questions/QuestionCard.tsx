import {
    Stack,
    Typography,
    Button,
    TextField,
    IconButton,
    Card,
    CardContent,
    Box,
    Chip,
    Divider,
    Collapse,
} from '@mui/material';
import {
    Add,
    Delete,
    DragHandle,
    AccessTime,
    RadioButtonUnchecked,
    Remove,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from '@mui/icons-material';
import { MotionStack } from '@/components/motion';
import { Question } from '@/types';
import { X } from 'lucide-react';
import { useState } from 'react';

interface QuestionCardProps {
    expanded?: boolean;
    question: Question;
    index: number;
    onUpdateText: (text: string) => void;
    onUpdateOption: (optionIndex: number, text: string) => void;
    onAddOption: () => void;
    onRemoveOption: (optionIndex: number) => void;
    onSetCorrectAnswer: (optionIndex: number) => void;
    onUpdateDuration: (duration: number) => void;
    onRemove: () => void;
    onExpand?: () => void;
}

export default function QuestionCard({
    question,
    index,
    expanded = false,
    onUpdateText,
    onUpdateOption,
    onAddOption,
    onRemoveOption,
    onSetCorrectAnswer,
    onUpdateDuration,
    onRemove,
    onExpand
}: QuestionCardProps) {


    const toggleExpanded = () => onExpand?.();

    return (
        <Card variant="outlined" sx={{
            position: "relative",
            borderRadius: 0.4,
            border: 'none',
            boxShadow: "0px 0px 0px 1px #aaa"
        }}>
            <CardContent>
                <Stack spacing={2}>
                    {/* Question Header - Always Visible */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DragHandle
                            sx={{
                                cursor: 'grab',
                                color: 'text.secondary',
                                '&:active': { cursor: 'grabbing' },
                            }}
                        />
                        <Chip
                            label={`Q${index + 1}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />

                        {/* Question Preview (when collapsed) */}
                        {!expanded && (
                            <Typography
                                onClick={toggleExpanded}
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: "pointer",
                                    "&:hover": {
                                        color: 'primary.main'
                                    }
                                }}>
                                {question.text || "Untitled question"}
                            </Typography>
                        )}

                        <Box flex={1} />

                        {expanded && (
                            <IconButton
                                size="small"
                                onClick={toggleExpanded}
                                sx={{
                                    transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                                    transition: 'transform 0.2s ease',
                                }}>
                                <KeyboardArrowUp />
                            </IconButton>
                        )}

                        <IconButton onClick={onRemove} color="error" size="small" sx={{ border: 'none' }}>
                            <X />
                        </IconButton>
                    </Stack>

                    {/* Collapsible Content */}
                    <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Stack spacing={2}>
                            {/* Question Text */}
                            <TextField
                                fullWidth
                                label="Question"
                                value={question.text}
                                onChange={(e) => onUpdateText(e.target.value)}
                                multiline
                                maxRows={4}
                            />

                            {/* Duration Control */}
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ "& .MuiInputBase-root": { border: "none" } }}>
                                <TextField
                                    type="number"
                                    value={question.duration}
                                    onChange={(e) => onUpdateDuration(Number(e.target.value))}
                                    slotProps={{
                                        htmlInput: {
                                            min: 5,
                                            max: 300
                                        },
                                        input: {
                                            startAdornment: (
                                                <AccessTime color="action" sx={{ fontSize: 14, mr: 1 }} />
                                            )
                                        }
                                    }}
                                    size="small"
                                    sx={{ width: '100px', border: 'none' }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    seconds
                                </Typography>
                            </Stack>

                            <Divider />

                            {/* Options */}
                            <Stack spacing={1}>
                                {question.options.map((option, optionIndex) => (
                                    <MotionStack
                                        key={optionIndex}
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: optionIndex * 0.05 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => onSetCorrectAnswer(optionIndex)}
                                            color={question.correctAnswer === optionIndex ? 'primary' : 'default'}>
                                            <RadioButtonUnchecked />
                                        </IconButton>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder={`Option ${optionIndex + 1}`}
                                            value={option}
                                            onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
                                        />
                                        {question.options.length > 2 && (
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => onRemoveOption(optionIndex)}>
                                                <Remove fontSize="small" />
                                            </IconButton>
                                        )}
                                    </MotionStack>
                                ))}
                            </Stack>

                            {/* Add Option Button */}
                            <Button
                                startIcon={<Add />}
                                onClick={onAddOption}
                                disabled={question.options.length >= 6}
                                variant="outlined"
                                size="small"
                                sx={{ alignSelf: 'flex-start' }}>
                                Add Option {question.options.length < 6 && `(${question.options.length}/6)`}
                            </Button>

                            {/* Correct Answer Indicator */}
                            {question.correctAnswer !== undefined && (
                                <Chip
                                    label={`Correct: Option ${question.correctAnswer + 1}`}
                                    color="success"
                                    variant="filled"
                                    size="small"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            )}
                        </Stack>
                    </Collapse>

                    {/* Quick Info Footer (when collapsed) */}
                    {!expanded && (
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                                icon={<AccessTime sx={{ fontSize: 14 }} />}
                                label={`${question.duration}s`}
                                size="small"
                                variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {question.options.length} options
                            </Typography>
                            {question.correctAnswer !== undefined && (
                                <Chip
                                    label="✓ Answer set"
                                    color="success"
                                    size="small"
                                    variant="filled"
                                />
                            )}
                        </Stack>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}