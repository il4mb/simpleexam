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
    alpha,
} from '@mui/material';
import {
    Add,
    DragHandle,
    AccessTime,
    Remove,
    KeyboardArrowDown,
    KeyboardArrowUp,
    CheckBox,
    SquareOutlined,
} from '@mui/icons-material';
import { MotionBox, MotionIconButton, MotionStack } from '@/components/motion';
import { Question, QuestionOption } from '@/types';
import { X } from 'lucide-react';
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { getColor } from '@/theme/colors';
import { AnimatePresence } from 'framer-motion';
import { enqueueSnackbar } from 'notistack';

interface QuestionCardProps {
    expanded?: boolean;
    question: Question;
    index: number;
    onChange: (patch: Partial<Question>) => void;
    onRemove: () => void;
    onExpand?: () => void;
}

export default function QuestionCard({
    question,
    index,
    expanded = false,
    onChange,
    onRemove,
    onExpand
}: QuestionCardProps) {

    const toggleExpanded = () => onExpand?.();

    const invokeChange = useCallback((key: keyof Question, value: any) => {
        onChange({ [key]: value });
        if (key == "multiple" && value === false) {
            resetMultipleChoice(value);
        }
    }, [question, onChange]);


    const resetMultipleChoice = useCallback((multiple: boolean) => {
        const correctIndexes = question.options
            .map((opt, i) => (opt.correct ? i : -1))
            .filter(i => i !== -1);

        if (correctIndexes.length <= 1) return;
        const firstIndex = correctIndexes[0];
        const newOptions = question.options.map((opt, idx) => ({
            ...opt,
            correct: idx === firstIndex,
        }));

        onChange({ options: newOptions, multiple });
    }, [question, onChange]);

    const handleUpdateText = useCallback((text: string) => {
        invokeChange("text", text);
    }, [question, invokeChange]);

    const handleUpdateOption = useCallback((optionIndex: number, text: string) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], text };
        invokeChange("options", newOptions);
    }, [invokeChange, question]);

    const handleAddOption = useCallback(() => {
        if (question.options.length >= 6) return;

        const newOption: QuestionOption = {
            id: nanoid(),
            text: '',
            correct: false,
            score: 0
        };

        const newOptions = [...question.options, newOption];
        invokeChange("options", newOptions);
    }, [invokeChange, question]);

    const handleRemoveOption = useCallback((optionIndex: number) => {
        if (question.options.length <= 2) return;
        const newOptions = question.options.filter((_, index) => index !== optionIndex);
        invokeChange("options", newOptions);
    }, [question, invokeChange]);

    const handleUpdateOptionScore = useCallback((optionId: string, score: number) => {
        const newOptions = question.options.map(opt =>
            opt.id === optionId ? { ...opt, score } : opt
        );
        invokeChange("options", newOptions);
    }, [invokeChange, question]);

    // Update duration
    const handleUpdateDuration = useCallback((duration: number) => {
        invokeChange("duration", Math.max(5, Math.min(300, duration)));
    }, [invokeChange, question]);

    const toggleCorrectOption = useCallback((optId: string) => () => {
        const exist = question.options.find(opt => opt.id === optId);
        if (!exist) return;

        // toggle
        const newCorrect = !exist.correct;

        // previous total correct
        const prevCorrect = question.options.filter(e => e.correct).length;
        const totalCorrect = newCorrect ? prevCorrect + 1 : prevCorrect - 1;

        // SINGLE CHOICE MODE
        if (!question.multiple) {
            if (!newCorrect) {
                enqueueSnackbar("Minimal harus ada satu opsi yang benar!", { variant: "warning" });
                return;
            }

            const newOptions = question.options.map(opt =>
                opt.id === optId
                    ? { ...opt, correct: true, score: 10 }
                    : { ...opt, correct: false, score: 0 }
            );

            invokeChange("options", newOptions);
            return;
        }

        // MULTICHOICE MODE
        if (totalCorrect < 1) {
            enqueueSnackbar("Minimal harus ada satu opsi yang benar!", { variant: "warning" });
            return;
        }

        const score = parseFloat((10 / totalCorrect).toFixed(1));

        const newOptions = question.options.map(opt => {
            const isTarget = opt.id === optId;
            const correct = isTarget ? newCorrect : opt.correct;

            return {
                ...opt,
                correct,
                score: correct ? score : 0
            };
        });

        invokeChange("options", newOptions);
    }, [question, invokeChange]);


    // Get correct answer display text
    const getCorrectAnswerDisplay = () => {
        const correctOptions = question.options.filter(opt => opt.correct);
        if (correctOptions.length === 0) return "No answer set";

        if (question.multiple) {
            const correctLetters = correctOptions.map((_, index) =>
                String.fromCharCode(65 + question.options.findIndex(opt => opt.id === correctOptions[index].id))
            );
            return `Correct: ${correctLetters.join(', ')}`;
        } else {
            const correctIndex = question.options.findIndex(opt => opt.correct);
            return `Correct: Option ${String.fromCharCode(65 + correctIndex)}`;
        }
    };

    // Get option letter
    const getOptionLetter = (index: number) => {
        return String.fromCharCode(65 + index);
    };

    return (
        <Card
            variant="outlined"
            sx={{
                position: "relative",
                borderRadius: 2,
                border: '1px solid',
                borderColor: expanded ? 'primary.main' : 'divider',
                boxShadow: expanded ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                // transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'primary.light',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }
            }}>
            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                <Stack spacing={2}>
                    {/* Header */}
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <DragHandle
                            sx={{
                                cursor: 'grab',
                                color: 'text.secondary',
                                '&:active': { cursor: 'grabbing' },
                                '&:hover': { color: 'primary.main' }
                            }}
                        />
                        <Chip
                            label={`Q${index + 1}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
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

                        {/* Expand/Collapse Button */}
                        <IconButton
                            size="small"
                            onClick={toggleExpanded}
                            sx={{
                                transform: expanded ? 'rotate(0deg)' : 'rotate(180deg)',
                                transition: 'transform 0.2s ease',
                                color: 'text.secondary',
                                '&:hover': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.contrastText'
                                }
                            }}>
                            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>

                        {/* Delete Button */}
                        <IconButton
                            onClick={onRemove}
                            color="error"
                            size="small"
                            sx={{
                                '&:hover': {
                                    backgroundColor: 'error.light',
                                    color: 'error.contrastText'
                                }
                            }}>
                            <X size={18} />
                        </IconButton>
                    </Stack>

                    <AnimatePresence mode={"sync"}>
                        {expanded && (
                            <MotionStack key={"details"} spacing={3}>
                                {/* Question Text */}
                                <TextField
                                    fullWidth
                                    label="Question Text"
                                    value={question.text}
                                    onChange={(e) => handleUpdateText(e.target.value)}
                                    multiline
                                    minRows={2}
                                    maxRows={6}
                                    placeholder="Enter your question here..."
                                />

                                {/* Settings Row */}
                                <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} flexWrap="wrap" gap={2}>
                                    <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                        <TextField
                                            type="number"
                                            value={question.duration || 30}
                                            onChange={(e) => handleUpdateDuration(Number(e.target.value))}
                                            slotProps={{
                                                htmlInput: {
                                                    min: 5,
                                                    max: 300
                                                },
                                                input: {
                                                    startAdornment: (
                                                        <AccessTime color="action" sx={{ fontSize: 16, mr: 1 }} />
                                                    )
                                                }
                                            }}
                                            size="small"
                                            sx={{ width: '120px' }}
                                            label="Duration"
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                            seconds
                                        </Typography>
                                    </Stack>

                                    <Stack direction={"row"} alignItems={"center"} spacing={1} onClick={() => invokeChange("multiple", !question.multiple)}>
                                        <MotionIconButton color={question.multiple ? "primary" : "secondary"}>
                                            {question.multiple ? <CheckBox /> : <SquareOutlined />}
                                        </MotionIconButton>
                                        <Typography>
                                            Multiple Choice
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Divider />

                                {/* Options Section */}
                                <Stack spacing={2}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                        Options
                                    </Typography>

                                    {question.options.map((option, optionIndex) => (
                                        <MotionStack
                                            key={option.id}
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: optionIndex * 0.05 }}
                                            sx={{ width: '100%' }}>
                                            {/* Option Letter */}
                                            <MotionBox
                                                initial={{ scale: 1 }}
                                                whileHover={{ scale: 1.1 }}
                                                onClick={toggleCorrectOption(option.id)}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    backgroundColor: alpha(getColor(option.correct ? "success" : "secondary")[400], 0.4),
                                                    color: option.correct ? 'white' : 'text.primary',
                                                    border: "2px solid",
                                                    borderColor: getColor(option.correct ? "success" : "secondary")[400],
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.875rem',
                                                    flexShrink: 0,
                                                    cursor: "pointer"
                                                }}>
                                                {getOptionLetter(optionIndex)}
                                            </MotionBox>

                                            {/* Option Text */}
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder={`Option ${optionIndex + 1}`}
                                                value={option.text}
                                                onChange={(e) => handleUpdateOption(optionIndex, e.target.value)}
                                                sx={{ flex: 1 }} />

                                            {/* Score Input (only for correct options) */}
                                            {option.correct && (
                                                <MotionBox
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    sx={{ width: '100px' }}>
                                                    <TextField
                                                        type="number"
                                                        size='small'
                                                        label="Points"
                                                        value={option.score || 0}
                                                        onChange={(e) => handleUpdateOptionScore(option.id, Number(e.target.value))}
                                                        slotProps={{
                                                            htmlInput: {
                                                                min: 0,
                                                                max: 100
                                                            }
                                                        }}
                                                    />
                                                </MotionBox>
                                            )}

                                            {/* Remove Option Button */}
                                            {question.options.length > 2 && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveOption(optionIndex)}
                                                    disabled={question.options.length <= 2}>
                                                    <Remove fontSize="small" />
                                                </IconButton>
                                            )}
                                        </MotionStack>
                                    ))}
                                </Stack>

                                {/* Add Option Button */}
                                <Button
                                    startIcon={<Add />}
                                    onClick={handleAddOption}
                                    disabled={question.options.length >= 6}
                                    variant="outlined"
                                    size="small"
                                    sx={{ alignSelf: 'flex-start' }}>
                                    Add Option {question.options.length < 6 && `(${question.options.length}/6)`}
                                </Button>

                                {/* Correct Answer Indicator */}
                                <Chip
                                    label={getCorrectAnswerDisplay()}
                                    color={question.options.some(opt => opt.correct) ? "success" : "default"}
                                    variant="filled"
                                    size="small"
                                    sx={{ alignSelf: 'flex-start' }}
                                />
                            </MotionStack>
                        )}


                        {/* Quick Info Footer (when collapsed) */}
                        {!expanded && (
                            <Stack key={"quick-info"} direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <Chip
                                    icon={<AccessTime sx={{ fontSize: 14 }} />}
                                    label={`${question.duration || 30}s`}
                                    size="small"
                                    variant="outlined"
                                />
                                {question.multiple && (
                                    <Chip
                                        label="Pilihan Ganda"
                                        color="secondary"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                                <Typography variant="caption" color="text.secondary">
                                    {question.options.length} Pilihan
                                </Typography>
                                
                            </Stack>
                        )}
                    </AnimatePresence>
                </Stack>
            </CardContent>
        </Card>
    );
}