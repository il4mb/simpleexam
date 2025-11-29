import { QuizContext } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomManager } from './RoomManager';
import * as Y from "yjs";
import { ydoc } from '@/libs/yjs';
import { useCurrentUser } from './SessionProvider';
import { useYArray, useYMap } from '@/hooks/useY';
import { useQuestions } from './QuestionsProvider';
import { Answer, Question } from '@/types';
import { useTransition } from '@/hooks/useTransition';
import { join } from 'path';

type TQuizRoom = {
    questionIndex?: number;
    questionStartTime?: number;
    answers?: Answer[];
    readyUidList?: string[];
    autoPlay?: boolean;
    quizTransition?: boolean;
    startTime?: number;
    endTime?: number;
}

export interface QuizProviderProps {
    children?: ReactNode;
    yRoom: Y.Map<any>;
}

export default function QuizProvider({ children, yRoom }: QuizProviderProps) {

    const currentUser = useCurrentUser();
    const { room, isHost, updateRoom } = useRoomManager<TQuizRoom>();
    const { questions } = useQuestions();
    const [roomStatus, setRoomStatus] = useState(room.status);

    // Yjs arrays
    const yAnswers = useMemo(() => {
        let map = yRoom.get('answersMap'); // Gunakan nama baru untuk menghindari konflik data lama
        if (!map) {
            map = new Y.Map<Record<string, Answer>>();
            yRoom.set('answersMap', map);
        }
        return map as Y.Map<Record<string, Answer>>;
    }, [yRoom]);

    const yReadyUidList = useMemo(() => {
        let arr = yRoom.get('readyUids');
        if (!arr) {
            arr = new Y.Array<string>();
            yRoom.set('readyUids', arr);
        }
        return arr as Y.Array<string>;
    }, [yRoom]);

    // Helper untuk convert Map ke Array agar kompatibel dengan UI yang ada
    const answersMap = useYMap<Record<string, Answer>>(yAnswers); // Asumsi Anda punya hook useYMap, jika tidak gunakan forceUpdate
    const answers = useMemo(() => Object.values(answersMap), [answersMap]);
    const readyUids = useYArray(yReadyUidList);

    const transitionDelay = 15000;
    const autoPlay = room.autoPlay === true;
    const questionIndex = typeof room.questionIndex === "number" ? room.questionIndex : -1;
    const questionStartTime = room.questionStartTime || 0;

    const question = useMemo<Question | undefined>(() => questions[questionIndex], [questions, questionIndex]);
    const [transition, withDelayed] = useTransition(transitionDelay);
    const transitionRef = useRef(transition);
    const immutableRef = useRef(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Quiz control functions
    const imReady = useCallback(() => {
        const uid = currentUser?.id;
        if (!uid) return;

        if (!readyUids.includes(uid)) {
            ydoc.transact(() => {
                yReadyUidList.push([uid]);
            });
        }
    }, [currentUser?.id, readyUids, yReadyUidList]);

    const setAutoPlay = useCallback((autoPlay: boolean) => {
        if (!isHost) return;
        ydoc.transact(() => {
            yRoom.set("autoPlay", autoPlay);
        });
    }, [isHost, yRoom]);

    const startQuiz = useCallback(() => {
        if (!isHost) {
            console.warn("Non host attempted to start quiz");
            return;
        }
        immutableRef.current = true;
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", 0);
            yRoom.set("questionStartTime", Date.now());
            yRoom.set("startTime", Date.now());
            yRoom.set("status", "playing");
            yRoom.set("quizTransition", false);
            yAnswers.clear();
            yReadyUidList.delete(0, yReadyUidList.length);
        });
    }, [isHost, yRoom, answers, yReadyUidList]);

    const finishQuiz = useCallback(() => {
        if (!isHost) {
            console.warn("Non host attempted to finish quiz");
            return;
        }
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", -1);
            yRoom.set("endTime", Date.now());
            yRoom.set("status", "ended");
            yRoom.set("quizTransition", false);
        });
    }, [isHost, yRoom]);

    const nextQuiz = useCallback(async () => {
        if (!isHost) {
            console.warn("Non host attempted to navigate quiz");
            return;
        }

        if (isTransitioning) return;

        setIsTransitioning(true);
        const nextIndex = questionIndex + 1;

        if (nextIndex > questions.length - 1) {
            finishQuiz();
            setIsTransitioning(false);
            return;
        }

        try {
            yRoom.doc?.transact(() => {
                yRoom.set("questionIndex", nextIndex);
                yRoom.set("questionStartTime", Date.now());
                yRoom.set("quizTransition", false);
            });
        } catch (error) {
            console.error("Error moving to next question:", error);
        } finally {
            setIsTransitioning(false);
        }
    }, [isHost, questionIndex, questions.length, yRoom, finishQuiz, isTransitioning]);

    const prevQuiz = useCallback(() => {
        if (!isHost) {
            console.warn("Non host attempted to navigate quiz");
            return;
        }
        const prevIndex = Math.max(0, questionIndex - 1);
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", prevIndex);
            yRoom.set("questionStartTime", Date.now());
        });
    }, [isHost, questionIndex, yRoom]);

    const jumpToQuestion = useCallback((targetIndex: number) => {
        if (!isHost) return;
        if (targetIndex < 0 || targetIndex >= questions.length) return;

        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", targetIndex);
            yRoom.set("questionStartTime", Date.now());
            yRoom.set("quizTransition", false);
        });
    }, [isHost, questions.length, yRoom]);

    const pauseQuiz = useCallback(() => {
        if (!isHost) return;
        yRoom.doc?.transact(() => {
            yRoom.set("status", "paused");
        });
    }, [isHost, yRoom]);

    const resumeQuiz = useCallback(() => {
        if (!isHost) return;
        yRoom.doc?.transact(() => {
            yRoom.set("status", "playing");
            // Reset start time to account for pause
            if (questionIndex >= 0) {
                yRoom.set("questionStartTime", Date.now());
            }
        });
    }, [isHost, yRoom, questionIndex]);

    // Answer submission
    const submitAnswer = useCallback((questionId: string, optionsId: string[]) => {
        const uid = currentUser?.id;
        // Validasi ketat
        if (!uid || !yRoom.doc) return;

        if (!optionsId) {
            console.warn("No options selected");
            return;
        }

        const now = Date.now();

        // Key unik: kombinasi UID dan QuestionID (jika user bisa jawab banyak soal)
        // Atau cukup UID jika 1 user hanya punya 1 jawaban aktif di room.
        // Asumsi: Kita simpan jawaban per soal.
        // Karena Y.Map flat, kita bisa buat key: `${uid}:${questionId}`
        const answerKey = `${uid}:${questionId}`;

        const answerData: Answer = {
            uid,
            questionId,
            optionsId,
            timestamp: now,
            timeSpent: now - (room.questionStartTime || 0)
        };

        try {
            yRoom.doc.transact(() => {
                // @ts-ignore
                yAnswers.set(answerKey, answerData);
            });
        } catch (error) {
            console.error("Error submitting answer:", error);
        }
    }, [currentUser?.id, room.questionStartTime, yRoom, yAnswers]);

    // Get user's answer for specific question
    const getUserAnswer = useCallback((questionId: string) => {
        const uid = currentUser?.id;
        if (!uid) return null;
        return answers.find(answer => answer.uid === uid && answer.questionId === questionId);
    }, [currentUser?.id, answers]);

    // Get all answers for specific question
    const getQuestionAnswers = useCallback((questionId: string) => {
        return answers.filter(answer => answer.questionId === questionId);
    }, [answers]);

    // Get user statistics
    const getUserStats = useCallback((userId: string) => {
        const userAnswers = answers.filter(answer => answer.uid === userId);
        const totalAnswered = userAnswers.length;
        const totalTimeSpent = userAnswers.reduce((total, answer) => total + answer.timeSpent, 0);
        const averageTime = totalAnswered > 0 ? totalTimeSpent / totalAnswered : 0;

        return {
            totalAnswered,
            totalTimeSpent,
            averageTime
        };
    }, [answers]);

    // Sync transition state with Yjs
    useEffect(() => {
        if (!isHost) return;
        transitionRef.current = transition;
        yRoom.doc?.transact(() => {
            yRoom.set("quizTransition", transition);
        });
    }, [transition, isHost, yRoom]);


    // Handle host leaving
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (isHost) {
                updateRoom("status", "paused");
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isHost, updateRoom]);

    // Room status synchronization
    useEffect(() => {
        if (!isHost) return;
        if (roomStatus === room.status) return;

        try {
            if (room.status === "prepared") {
                console.log("Quiz prepared - initializing");
                yRoom.doc?.transact(() => {
                    yRoom.set("autoPlay", true);
                    yRoom.set("questionIndex", -1);
                    yRoom.set("answers", new Y.Array());
                    yRoom.set("startTime", Date.now());
                    yRoom.set("quizTransition", false);
                    yAnswers.clear();
                    yReadyUidList.delete(0, yReadyUidList.length);
                });
            } else if (room.status === "paused") {
                console.log("Quiz paused");
            } else if (room.status === "ended") {
                console.log("Quiz ended");
                yRoom.doc?.transact(() => {
                    yRoom.set("autoPlay", false);
                    yRoom.set("questionIndex", -1);
                    yRoom.set("endTime", Date.now());
                    yReadyUidList.delete(0, yReadyUidList.length);
                });
            }
        } catch (error) {
            console.error("Error syncing room status:", error);
        }

        setRoomStatus(room.status);
    }, [room.status, roomStatus, isHost, yRoom, yReadyUidList, answers]);

    // Auto-play functionality
    useEffect(() => {
        if (!isHost || transitionRef.current || immutableRef.current || !autoPlay || room.status !== "playing" || isTransitioning) return;

        if (timeLeft <= 0 && questionIndex >= 0) {
            withDelayed(() => {
                immutableRef.current = true;
                nextQuiz();
            });
        }
    }, [timeLeft, withDelayed, nextQuiz, autoPlay, isHost, room.status, isTransitioning, questionIndex]);

    // Time left calculation
    useEffect(() => {

        immutableRef.current = true;
        if (!questionStartTime || !question?.duration || room.status !== "playing") {
            setTimeLeft(0);
            return;
        }

        const updateTimeLeft = () => {
            const elapsed = Math.floor((Date.now() - questionStartTime) / 1000);
            const left = Math.max(0, (question.duration || 30) - elapsed);
            if (immutableRef.current && left == 0) {
                immutableRef.current = false;
            }
            setTimeLeft(left);
        };

        updateTimeLeft();
        const timer = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [questionStartTime, questionIndex, question?.duration, room.status]);

    // Clean up ready status on page unload
    useEffect(() => {
        const uid = currentUser?.id;
        if (!uid) return;

        const cleanupUserData = () => {
            try {
                const arr = yReadyUidList.toArray();
                const index = arr.indexOf(uid);
                if (index !== -1) {
                    yRoom.doc?.transact(() => {
                        yReadyUidList.delete(index, 1);
                    });
                }
            } catch (error) {
                console.error("Error cleaning up user data:", error);
            }
        };

        window.addEventListener("beforeunload", cleanupUserData);
        window.addEventListener("pagehide", cleanupUserData);

        return () => {
            window.removeEventListener("beforeunload", cleanupUserData);
            window.removeEventListener("pagehide", cleanupUserData);
        };
    }, [currentUser?.id, yReadyUidList]);

    // Quiz statistics
    const quizStats = useMemo(() => {
        const totalQuestions = questions.length;
        const totalParticipants = new Set(answers.map(a => a.uid)).size;
        const currentQuestionAnswers = question ? getQuestionAnswers(question.id) : [];
        const currentQuestionParticipants = new Set(currentQuestionAnswers.map(a => a.uid)).size;
        const totalAnswers = answers.length;

        return {
            totalQuestions,
            totalParticipants,
            currentQuestionAnswers: currentQuestionAnswers.length,
            currentQuestionParticipants,
            totalAnswers,
            completionRate: totalParticipants > 0 ? (currentQuestionParticipants / totalParticipants) * 100 : 0,
            averageAnswersPerQuestion: totalQuestions > 0 ? totalAnswers / totalQuestions : 0
        };
    }, [questions, answers, question, getQuestionAnswers]);

    const valueContext = useMemo(() => ({
        // Quiz state
        isQuizActive: room.status === "playing",
        isQuizPaused: room.status === "paused",
        isQuizEnded: room.status === "ended",
        questionIndex,
        questionStartTime,
        autoPlay,
        timeLeft,
        transition: Boolean(room.quizTransition),
        transitionDelay,
        isTransitioning,

        // Questions
        currentQuestion: question,
        totalQuestions: questions.length,

        // User actions
        readyUids,
        imReady,
        submitAnswer,
        getUserAnswer,
        getQuestionAnswers,
        getUserStats,

        // Host controls
        isHost,
        startQuiz,
        nextQuiz,
        prevQuiz,
        finishQuiz,
        pauseQuiz,
        resumeQuiz,
        jumpToQuestion,
        setAutoPlay,

        // Statistics
        quizStats,
        answers,

        // Navigation helpers
        isFirstQuestion: questionIndex === 0,
        isLastQuestion: questionIndex === questions.length - 1,
        hasNextQuestion: questionIndex < questions.length - 1,
        hasPreviousQuestion: questionIndex > 0,

        // Progress
        progress: questions.length > 0 ? ((questionIndex + 1) / questions.length) * 100 : 0,
        elapsedTime: room.startTime ? Date.now() - room.startTime : 0,
        remainingQuestions: Math.max(0, questions.length - questionIndex - 1)
    }), [
        room,
        questionIndex,
        questionStartTime,
        autoPlay,
        timeLeft,
        transitionDelay,
        isTransitioning,
        question,
        questions.length,
        readyUids,
        imReady,
        submitAnswer,
        getUserAnswer,
        getQuestionAnswers,
        getUserStats,
        isHost,
        startQuiz,
        nextQuiz,
        prevQuiz,
        finishQuiz,
        pauseQuiz,
        resumeQuiz,
        jumpToQuestion,
        setAutoPlay,
        quizStats,
        answers
    ]);

    return (
        <QuizContext.Provider value={valueContext}>
            {children}
        </QuizContext.Provider>
    );
}