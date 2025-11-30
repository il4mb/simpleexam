import { CloudDownloadRounded } from '@mui/icons-material';
import { Button } from '@mui/material';
import Tooltip from '../Tooltip';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRoomManager } from '@/contexts/RoomManager';
import { useQuestions } from '@/contexts/QuestionsProvider';
import { useAnswers } from '@/hooks/useAnswers';
import { useExpressionResults } from '@/hooks/useExpressionResults';
import { useParticipants } from '@/hooks/useParticipants';
import { useQuiz } from '@/hooks/useQuiz';

export default function DownloadResults() {
    const { room } = useRoomManager();
    const { participants } = useParticipants();
    const { questions } = useQuestions();
    const { answers, getQuestionAnswers, getUserStats } = useAnswers();
    const expressions = useExpressionResults();

    // Calculate quiz statistics from available data
    const calculateQuizStats = () => {
        const totalParticipants = participants.filter(p => 
            p.id !== room.createdBy && ["active", "left"].includes(p.status)
        ).length;
        
        const totalAnswers = answers.length;
        const participantsWithAnswers = new Set(answers.map(a => a.uid)).size;
        
        const completionRate = totalParticipants > 0 ? 
            (participantsWithAnswers / totalParticipants) * 100 : 0;
            
        const averageAnswersPerQuestion = questions.length > 0 ? 
            totalAnswers / questions.length : 0;

        return {
            totalParticipants,
            totalAnswers,
            completionRate,
            averageAnswersPerQuestion
        };
    };

    // Calculate points for a user based on correct answers
    const calculateUserPoints = (userId: string) => {
        const userAnswers = answers.filter(a => a.uid === userId);
        let totalPoints = 0;

        userAnswers.forEach(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            if (question) {
                // Sum points for selected correct options
                answer.optionsId.forEach(optionId => {
                    const option = question.options.find(opt => opt.id === optionId);
                    if (option && option.correct) {
                        totalPoints += option.score || 1; // Default to 1 point if no score specified
                    }
                });
            }
        });

        return totalPoints;
    };

    const generateExcelData = () => {
        const quizStats = calculateQuizStats();

        // Sheet 1: Quiz Summary
        const summaryData = [
            ['Quiz Summary', ''],
            ['Room Name', room.name],
            ['Total Participants', quizStats.totalParticipants],
            ['Total Questions', questions.length],
            ['Total Answers', quizStats.totalAnswers],
            ['Participants with Answers', quizStats.totalParticipants > 0 ? 
                `${Math.round(quizStats.completionRate)}%` : '0%'],
            ['Average Answers Per Question', quizStats.averageAnswersPerQuestion.toFixed(2)],
            ['', ''],
            ['Date Generated', new Date().toLocaleString()]
        ];

        // Sheet 2: Participant Results
        const participantResults = participants
            .filter(participant => participant.id !== room.createdBy) // Exclude host
            .map(participant => {
                const userStats = getUserStats(participant.id);
                const userAnswers = answers.filter(a => a.uid === participant.id);

                // Calculate correct answers
                let correctOptions = 0;
                let fullyCorrectAnswers = 0;
                let totalPoints = 0;

                userAnswers.forEach(answer => {
                    const question = questions.find(q => q.id === answer.questionId);
                    if (question) {
                        const correctOptionIds = question.options.filter(opt => opt.correct).map(opt => opt.id);
                        const correctSelected = answer.optionsId.filter(optId =>
                            correctOptionIds.includes(optId)
                        ).length;
                        correctOptions += correctSelected;

                        // Check if fully correct
                        const isFullyCorrect = correctOptionIds.length > 0 &&
                            correctOptionIds.every(id => answer.optionsId.includes(id)) &&
                            answer.optionsId.every(id => correctOptionIds.includes(id));

                        if (isFullyCorrect) fullyCorrectAnswers++;

                        // Calculate points for this answer
                        answer.optionsId.forEach(optionId => {
                            const option = question.options.find(opt => opt.id === optionId);
                            if (option && option.correct) {
                                totalPoints += option.score || 1;
                            }
                        });
                    }
                });

                const accuracy = userAnswers.length > 0 ? (correctOptions / userAnswers.length) * 100 : 0;

                return {
                    'Participant ID': participant.id,
                    'Name': participant.name,
                    'Status': participant.status,
                    'Total Answers': userAnswers.length,
                    'Correct Options': correctOptions,
                    'Fully Correct Answers': fullyCorrectAnswers,
                    'Accuracy (%)': Math.round(accuracy),
                    'Total Time Spent (ms)': userStats.totalTimeSpent,
                    'Average Time (ms)': userStats.averageTime,
                    'Points': totalPoints
                };
            });

        // Sheet 3: Detailed Answers
        const detailedAnswers = answers.map(answer => {
            const participant = participants.find(p => p.id === answer.uid);
            const question = questions.find(q => q.id === answer.questionId);
            const correctOptionIds = question?.options.filter(opt => opt.correct).map(opt => opt.id) || [];
            const isCorrect = answer.optionsId.some(optId => correctOptionIds.includes(optId));

            // Calculate points for this specific answer
            let answerPoints = 0;
            if (question) {
                answer.optionsId.forEach(optionId => {
                    const option = question.options.find(opt => opt.id === optionId);
                    if (option && option.correct) {
                        answerPoints += option.score || 1;
                    }
                });
            }

            return {
                'Participant ID': answer.uid,
                'Participant Name': participant?.name || 'Unknown',
                'Question ID': answer.questionId,
                'Question Text': question?.text || 'Unknown',
                'Selected Options': answer.optionsId.join(', '),
                'Correct Options': correctOptionIds.join(', '),
                'Is Correct': isCorrect ? 'Yes' : 'No',
                'Points Earned': answerPoints,
                'Timestamp': new Date(answer.timestamp).toLocaleString(),
                'Time Spent (ms)': answer.timeSpent
            };
        });

        // Sheet 4: Questions Overview
        const questionsOverview = questions.map((question, index) => {
            const questionAnswers = getQuestionAnswers(question.id);
            const correctOptionIds = question.options.filter(opt => opt.correct).map(opt => opt.id);
            
            let correctAnswers = 0;
            let totalPointsEarned = 0;
            let totalPossiblePoints = 0;

            questionAnswers.forEach(answer => {
                const hasCorrect = answer.optionsId.some(optId => correctOptionIds.includes(optId));
                if (hasCorrect) correctAnswers++;

                // Calculate points for this answer
                answer.optionsId.forEach(optionId => {
                    const option = question.options.find(opt => opt.id === optionId);
                    if (option && option.correct) {
                        totalPointsEarned += option.score || 1;
                    }
                });
            });

            // Calculate total possible points for this question
            totalPossiblePoints = correctOptionIds.reduce((sum, optId) => {
                const option = question.options.find(opt => opt.id === optId);
                return sum + (option?.score || 1);
            }, 0);

            const accuracyRate = questionAnswers.length > 0 ? 
                Math.round((correctAnswers / questionAnswers.length) * 100) : 0;

            const pointsEfficiency = totalPossiblePoints > 0 ?
                Math.round((totalPointsEarned / (totalPossiblePoints * questionAnswers.length)) * 100) : 0;

            return {
                'Question Number': index + 1,
                'Question ID': question.id,
                'Text': question.text,
                'Type': question.multiple ? 'Multiple Choice' : 'Single Choice',
                'Total Options': question.options.length,
                'Correct Options': correctOptionIds.join(', '),
                'Total Answers': questionAnswers.length,
                'Correct Answers': correctAnswers,
                'Accuracy Rate (%)': accuracyRate,
                'Total Points Earned': totalPointsEarned,
                'Points Efficiency (%)': pointsEfficiency
            };
        });

        // Sheet 5: Expression Data
        const expressionData: { 'Question ID': string; 'Question Text': string; 'Participant ID': string; 'Participant Name': string; Happy: number; Sad: number; Angry: number; Surprised: number; Fearful: number; Disgusted: number; Neutral: number; 'Total Expressions': number; }[] = [];
        expressions.forEach(expressionResult => {
            const question = questions.find(q => q.id === expressionResult.question.id);
            expressionResult.expressions.forEach(expr => {
                expressionData.push({
                    'Question ID': expressionResult.question.id,
                    'Question Text': question?.text || 'Unknown',
                    'Participant ID': expr.user?.id || 'Unknown',
                    'Participant Name': expr.user?.name || 'Unknown',
                    'Happy': expr.data.happy || 0,
                    'Sad': expr.data.sad || 0,
                    'Angry': expr.data.angry || 0,
                    'Surprised': expr.data.surprised || 0,
                    'Fearful': expr.data.fearful || 0,
                    'Disgusted': expr.data.disgusted || 0,
                    'Neutral': expr.data.neutral || 0,
                    'Total Expressions': Object.values(expr.data).reduce((sum: number, val) => sum + (val as number), 0)
                });
            });
        });

        return {
            summaryData,
            participantResults,
            detailedAnswers,
            questionsOverview,
            expressionData
        };
    };

    const exportToExcel = () => {
        try {
            const workbook = XLSX.utils.book_new();
            const data = generateExcelData();

            // Add Summary Sheet
            const summarySheet = XLSX.utils.aoa_to_sheet(data.summaryData);
            XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

            // Add Participant Results Sheet
            if (data.participantResults.length > 0) {
                const participantSheet = XLSX.utils.json_to_sheet(data.participantResults);
                XLSX.utils.book_append_sheet(workbook, participantSheet, 'Participant Results');
            }

            // Add Detailed Answers Sheet
            if (data.detailedAnswers.length > 0) {
                const answersSheet = XLSX.utils.json_to_sheet(data.detailedAnswers);
                XLSX.utils.book_append_sheet(workbook, answersSheet, 'Detailed Answers');
            }

            // Add Questions Overview Sheet
            if (data.questionsOverview.length > 0) {
                const questionsSheet = XLSX.utils.json_to_sheet(data.questionsOverview);
                XLSX.utils.book_append_sheet(workbook, questionsSheet, 'Questions Overview');
            }

            // Add Expression Data Sheet (if there's data)
            if (data.expressionData.length > 0) {
                const expressionSheet = XLSX.utils.json_to_sheet(data.expressionData);
                XLSX.utils.book_append_sheet(workbook, expressionSheet, 'Expression Data');
            }

            // Generate and download the file
            const excelBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const fileName = `${room.name.replace(/\s+/g, "_")}-Quiz_Results_${new Date().getTime()}.xlsx`;
            saveAs(blob, fileName);

        } catch (error) {
            console.error('Error exporting to Excel:', error);
            alert('Error generating Excel file. Please try again.');
        }
    };

    return (
        <Tooltip title={"Unduh Hasil Quiz"}>
            <Button
                variant='contained'
                startIcon={<CloudDownloadRounded />}
                onClick={exportToExcel}
                disabled={answers.length === 0}>
                Unduh Hasil
            </Button>
        </Tooltip>
    );
}