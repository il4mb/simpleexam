import { useState } from 'react';
import {
    Stack,
    Typography,
    Button,
    TextField,
    Card,
    CardContent,
    Box,
    Chip,
    IconButton,
    Grid,
} from '@mui/material';
import { Add, Edit, ExpandMore, ExpandLess, PlaylistAdd, Schedule, CheckCircle } from '@mui/icons-material';
import { MotionBox, MotionStack } from '@/components/motion';
import { Reorder } from 'framer-motion';
import QuestionCard from './QuestionCard';
import { useQuestions } from '@/contexts/QuestionsProvider';

export interface QuizProps { }

export default function QuestionEditor({ }: QuizProps) {
    const {
        questions,
        addQuestion,
        removeQuestion,
        updateQuestionText,
        updateOptionText,
        addOption,
        removeOption,
        setCorrectAnswer,
        updateDuration,
        reorder
    } = useQuestions();

    const [expanded, setExpanded] = useState<string>();
    const [newQuestionText, setNewQuestionText] = useState<string>();

    const handleAddQuestion = () => {
        if (!newQuestionText?.trim()) return;
        const id = addQuestion(newQuestionText);
        setNewQuestionText('');
        setExpanded(id);
    };

    const handleExpanded = (id: string) => () => {
        setExpanded(prev => prev == id ? undefined : id);
    }

    // Calculate summary statistics
    const totalDuration = questions.reduce((total, q) => total + q.duration, 0);
    const totalOptions = questions.reduce((total, q) => total + q.options.length, 0);
    const questionsWithAnswers = questions.filter(q => q.correctAnswer !== undefined).length;

    return (
        <Stack spacing={3} p={2}>
            {/* Header Card - Toggle between Summary and Create Question */}
            <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: 'background.default', border: '2px dashed', borderColor: 'divider' }}>
                <CardContent>
                    {newQuestionText === undefined ? (
                        <Stack spacing={3}>
                            {/* Summary Header */}
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="h5" fontWeight="bold">
                                    Editor Soal Kuis
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => setNewQuestionText('')}
                                    sx={{
                                        background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                                        borderRadius: 3,
                                        px: 3,
                                    }}>
                                    Buat Soal Baru
                                </Button>
                            </Stack>

                            {/* Summary Statistics */}
                            {questions.length > 0 ? (
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                    <Chip
                                        label={`${questions.length} Soal`}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${Math.round(totalDuration / 60)} Menit`}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${questionsWithAnswers}/${questions.length} Terisi`}
                                        color={questionsWithAnswers === questions.length ? "success" : "warning"}
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={`${totalOptions} Opsi`}
                                        color="info"
                                        variant="outlined"
                                    />
                                </Stack>
                            ) : (
                                <Box textAlign="center" py={4}>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>
                                        📝 Mulai membuat kuis Anda
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Klik "Buat Soal Baru" untuk menambahkan soal pertama
                                    </Typography>
                                </Box>
                            )}

                        </Stack>
                    ) : (
                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="h6" fontWeight="bold" flex={1}>
                                    Buat Soal Baru
                                </Typography>
                                <IconButton
                                    onClick={() => setNewQuestionText(undefined)}
                                    size="small">
                                    <ExpandLess />
                                </IconButton>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                <TextField
                                    fullWidth
                                    label="Teks Soal"
                                    value={newQuestionText}
                                    onChange={(e) => setNewQuestionText(e.target.value)}
                                    onKeyUp={(e) => e.key === 'Enter' && handleAddQuestion()}
                                    placeholder="Masukkan pertanyaan di sini..."
                                    multiline
                                    rows={2}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddQuestion}
                                    disabled={!newQuestionText.trim()}
                                    sx={{
                                        minWidth: '120px',
                                        height: '56px',
                                        borderRadius: 2,
                                    }}>
                                    Tambah
                                </Button>
                            </Stack>
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* Questions List */}
            {questions.length > 0 && (
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}>
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                            <Stack>
                                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                                    <Typography variant="h6" fontWeight="bold">
                                        Daftar Soal ({questions.length})
                                    </Typography>
                                    <Chip
                                        label="Drag untuk mengurutkan"
                                        size="small"
                                        variant="outlined"
                                        color="info"
                                    />
                                </Stack>

                                <Reorder.Group
                                    axis="y"
                                    values={questions}
                                    onReorder={reorder}
                                    style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <MotionStack spacing={2}>
                                        {questions.map((question, index) => (
                                            <Reorder.Item key={question.id} value={question}>
                                                <MotionBox
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <QuestionCard
                                                        expanded={question.id == expanded}
                                                        onExpand={handleExpanded(question.id)}
                                                        question={question}
                                                        index={index}
                                                        onUpdateText={(text) => updateQuestionText(question.id, text)}
                                                        onUpdateOption={(optionIndex, text) =>
                                                            updateOptionText(question.id, optionIndex, text)
                                                        }
                                                        onAddOption={() => addOption(question.id)}
                                                        onRemoveOption={(optionIndex) => removeOption(question.id, optionIndex)}
                                                        onSetCorrectAnswer={(optionIndex) => setCorrectAnswer(question.id, optionIndex)}
                                                        onUpdateDuration={(duration) => updateDuration(question.id, duration)}
                                                        onRemove={() => removeQuestion(question.id)}
                                                    />
                                                </MotionBox>
                                            </Reorder.Item>
                                        ))}
                                    </MotionStack>
                                </Reorder.Group>
                            </Stack>
                        </CardContent>
                    </Card>
                </MotionBox>
            )}

            {questions.length === 0 && newQuestionText === undefined && (
                <MotionBox
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    textAlign="center"
                    py={8}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        🎯 Belum ada soal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Mulai dengan membuat soal pertama di atas
                    </Typography>
                </MotionBox>
            )}
        </Stack>
    );
}