import QuestionAnalytics from '@/components/stats/QuestionAnalytics';
import StatsDashboard from '@/components/stats/StatsDashboard';
import { Button, Stack, Typography } from '@mui/material';

export interface pageProps {

}
export default function page({ }: pageProps) {
    return (
        <Stack sx={{ mt: 2 }}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Typography variant='h1'>
                    Hasil Quiz
                </Typography>
                <Stack direction={"row"} alignItems={"center"}>
                    <Button>
                        Download Exel
                    </Button>
                </Stack>
            </Stack>
            <StatsDashboard />
            <QuestionAnalytics />
        </Stack>
    );
}