import { Box, Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { Question } from '@/types';

interface QuestionPreviewCardProps {
    question: Question;
    index: number;
    totalQuestions: number;
}

export default function QuestionPreviewCard({ question, index, totalQuestions }: QuestionPreviewCardProps) {

    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                borderLeft: `4px solid`,
                borderLeftColor: 'primary.main'
            }}>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                            label={`Q${index + 1}`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            {index + 1} of {totalQuestions}
                        </Typography>
                        <Box flex={1} />
                        <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                                {question.duration}s
                            </Typography>
                        </Stack>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                            {question.options.length} options
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}