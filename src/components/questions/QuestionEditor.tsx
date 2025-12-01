import { useCallback, useState } from 'react';
import { Stack, Typography, Button, TextField, Card, CardContent, Box, Chip, IconButton, } from '@mui/material';
import { Add, DrawRounded, ExpandLess } from '@mui/icons-material';
import { MotionBox } from '@/components/motion';
import { Reorder } from 'framer-motion';
import QuestionCard from './QuestionCard';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { Question } from '@/types';
import QuestionImports from './QuestionImports';

export interface QuizProps { }

export default function QuestionEditor({ }: QuizProps) {

    const { questions, addQuestion, updateQuestion, removeQuestion, reorder } = useQuestions();
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


    const handleQuestionChange = useCallback((id: string) => (patch: Partial<Question>) => {
        updateQuestion(id, patch);
    }, [updateQuestion]);

    // Calculate summary statistics
    const totalDuration = questions.reduce((total, q) => total + q.duration, 0);
    const totalOptions = questions.reduce((total, q) => total + (q.options?.length || 0), 0);

    return (
        <Stack spacing={3} mt={3}>

            <Card variant="outlined" sx={{
                bgcolor: 'background.default',
                border: 'none',
                boxShadow: "0px 0px 0px 1px #91baf0ff, -6px 6px 0px #6197dfff"
            }}>
                <CardContent>
                    {newQuestionText === undefined ? (
                        <Stack spacing={3}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="h5" fontWeight="bold">
                                    Editor Quiz
                                </Typography>
                                <Stack direction={"row"} alignItems={"center"} spacing={1}>
                                    <Button
                                        variant="contained"
                                        size='small'
                                        startIcon={<DrawRounded />}
                                        onClick={() => setNewQuestionText('')}>
                                        Buat
                                    </Button>
                                    <QuestionImports />
                                </Stack>
                            </Stack>

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
                                        label={`${totalOptions} Pilihan`}
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

            {questions.length > 0 && (
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}>
                    <Card
                        variant="outlined"
                        sx={{
                            border: 'none',
                            boxShadow: "0px 0px 0px 1px currentColor, -6px 6px 0px currentColor",
                        }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                                <Typography variant="h6" fontWeight="bold">
                                    Daftar Soal ({questions.length})
                                </Typography>
                            </Stack>
                            <Reorder.Group
                                axis="y"
                                values={questions}
                                onReorder={reorder}
                                style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <Stack spacing={2}>
                                    {questions.map((question, index) => (
                                        <Reorder.Item key={question.id} value={question}>
                                            <MotionBox
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}>
                                                <QuestionCard
                                                    expanded={question.id == expanded}
                                                    onExpand={handleExpanded(question.id)}
                                                    question={question}
                                                    index={index}
                                                    onChange={handleQuestionChange(question.id)}
                                                    onRemove={() => removeQuestion(question.id)}
                                                />
                                            </MotionBox>
                                        </Reorder.Item>
                                    ))}
                                </Stack>
                            </Reorder.Group>
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