import { QuizContext, QuizEventArgs, QuizEventName, QuizState } from '@/hooks/useQuiz';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRoomManager } from './RoomManager';
import { useCurrentUser } from './SessionProvider';
import { useYArray } from '@/hooks/useY';
import { useQuestions } from './QuestionsProvider';
import { Answer, Question } from '@/types';
import { useTransition } from '@/hooks/useTransition';
import QuizAnswersProvider from './QuizAnswersProvider';
import { useCreateEvents } from "@/hooks/useCreateEvents";
import { enqueueSnackbar } from "notistack";
import * as Y from "yjs";
import RecordsProvider from './RecordsProvider';
import { useParticipants } from '@/hooks/useParticipants';

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

    const { addEventListener, emit } = useCreateEvents<QuizEventName, QuizEventArgs>();
    const currentUser = useCurrentUser();
    const { room, isHost, updateRoom } = useRoomManager<TQuizRoom>();
    const { questions } = useQuestions();
    const [roomStatus, setRoomStatus] = useState(room.status);
    const { activeParticipants } = useParticipants();

    const yJointQuizUid = useMemo(() => {
        let arr = yRoom.get('readyUids');
        if (!arr) {
            arr = new Y.Array<string>();
            yRoom.set('readyUids', arr);
        }
        return arr as Y.Array<string>;
    }, [yRoom]);

    const jointQuizUids = useYArray(yJointQuizUid);
    const isCurrentUserJoined = useMemo(() => Boolean(currentUser && jointQuizUids.includes(currentUser.id)), [currentUser?.id, jointQuizUids]);
    const totalQuizableParticipant = useMemo(() => activeParticipants.filter(p => p.id != room.createdBy).length, [room, activeParticipants]);
    const canPlayQuiz = useMemo(() => totalQuizableParticipant >= 3 && questions.length >= 3, [totalQuizableParticipant]);

    const transitionDelay = useMemo(() => room.enableLeaderboard ? 8000 : 4000, [room.enableLeaderboard]);
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
        const status = yRoom.get("status");

        if (!uid || status !== "prepared") {
            if (status == "playing") {
                enqueueSnackbar("Host telah memulai quiz sebelum kamu siap!", { variant: "warning" });
            } else {
                enqueueSnackbar("Quiz telah berakhir!", { variant: "default" });
            }
            return;
        }
        if (!uid || status !== "prepared") return;

        yRoom.doc?.transact(() => {
            if (!jointQuizUids.includes(uid)) {
                yJointQuizUid.push([uid]);
            }
        });
    }, [currentUser?.id, jointQuizUids, yJointQuizUid, room.status]);

    const setAutoPlay = useCallback((autoPlay: boolean) => {
        if (!isHost) return;
        yRoom.doc?.transact(() => {
            yRoom.set("autoPlay", autoPlay);
        });
    }, [isHost, yRoom]);

    const startQuiz = useCallback(() => {
        if (!canPlayQuiz) {
            enqueueSnackbar("Quiz belum dapat dimulai, periksa minimum soal dan peserta.", { variant: "warning" });
            return;
        }
        if (!isHost) {
            console.warn("Non host attempted to start quiz");
            return;
        }
        immutableRef.current = true;
        emit("start");
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", 0);
            yRoom.set("questionStartTime", Date.now());
            yRoom.set("startTime", Date.now());
            yRoom.set("status", "playing");
            yRoom.set("quizTransition", false);
        });
    }, [isHost, yRoom, emit, canPlayQuiz]);

    const finishQuiz = useCallback(() => {
        if (!isHost) {
            console.warn("Non host attempted to finish quiz");
            return;
        }
        emit("finish");
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", -1);
            yRoom.set("endTime", Date.now());
            yRoom.set("status", "ended");
            yRoom.set("quizTransition", false);
            yJointQuizUid.delete(0, yJointQuizUid.length);

        });
    }, [isHost, yRoom, yJointQuizUid, emit]);

    const nextQuiz = useCallback(async () => {
        if (!isHost) {
            console.warn("Non host attempted to navigate quiz");
            return;
        }

        if (isTransitioning) return;

        setIsTransitioning(true);
        const nextIndex = questionIndex + 1;
        emit("question-next", { nextIndex, prevIndex: questionIndex });
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
    }, [isHost, questionIndex, questions.length, yRoom, finishQuiz, isTransitioning, emit]);

    const prevQuiz = useCallback(() => {
        if (!isHost) {
            console.warn("Non host attempted to navigate quiz");
            return;
        }
        const prevIndex = Math.max(0, questionIndex - 1);
        emit("question-prev", { nextIndex: prevIndex, prevIndex: questionIndex });
        yRoom.doc?.transact(() => {
            yRoom.set("questionIndex", prevIndex);
            yRoom.set("questionStartTime", Date.now());
        });
    }, [isHost, questionIndex, yRoom, emit]);

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
        emit("pause");
        yRoom.doc?.transact(() => {
            yRoom.set("status", "paused");
        });
    }, [isHost, yRoom, emit]);

    const resumeQuiz = useCallback(() => {
        if (!isHost) return;
        emit("resume");
        yRoom.doc?.transact(() => {
            yRoom.set("status", "playing");
            if (questionIndex >= 0) {
                yRoom.set("questionStartTime", Date.now());
            }
        });
    }, [isHost, yRoom, questionIndex, emit]);


    // Sync transition state with Yjs
    useEffect(() => {
        if (!isHost) return;
        transitionRef.current = transition;
        yRoom.doc?.transact(() => {
            yRoom.set("quizTransition", transition);
        });
    }, [transition, isHost, yRoom]);

    // Room status synchronization
    useEffect(() => {
        if (!isHost) return;
        if (roomStatus === room.status) return;

        try {
            if (room.status === "prepared") {
                yRoom.doc?.transact(() => {
                    yRoom.set("autoPlay", true);
                    yRoom.set("questionIndex", -1);
                    yRoom.set("answers", new Y.Array());
                    yRoom.set("startTime", Date.now());
                    yRoom.set("quizTransition", false);
                    yJointQuizUid.delete(0, yJointQuizUid.length);
                });
                emit("initializing");
            } else if (room.status === "paused") {
                console.log("Quiz paused");
                emit("pause");
            } else if (room.status === "ended") {
                yRoom.doc?.transact(() => {
                    yRoom.set("autoPlay", false);
                    yRoom.set("questionIndex", -1);
                    yRoom.set("endTime", Date.now());
                    yJointQuizUid.delete(0, yJointQuizUid.length);
                });
                emit("finish");
            }
        } catch (error) {
            console.error("Error syncing room status:", error);
        }

        setRoomStatus(room.status);
    }, [room.status, roomStatus, isHost, yRoom, yJointQuizUid, emit]);

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
            const status = yRoom.get("status");
            try {
                if (status == "prepared") {
                    const arr = yJointQuizUid.toArray();
                    const index = arr.indexOf(uid);
                    if (index !== -1) {
                        yRoom.doc?.transact(() => {
                            yJointQuizUid.delete(index, 1);
                        });
                    }
                }
                if (isHost && status == "playing") {
                    updateRoom("status", "paused");
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
    }, [currentUser?.id, yJointQuizUid]);

    const valueContext = useMemo<QuizState>(() => ({
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
        totalQuizableParticipant,
        canPlayQuiz,

        // Questions
        currentQuestion: question,
        totalQuestions: questions.length,

        // User actions
        readyUids: jointQuizUids,
        isCurrentUserJoined,
        imReady,

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
        addEventListener,

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
        jointQuizUids,
        isCurrentUserJoined,
        totalQuizableParticipant,
        canPlayQuiz,
        imReady,
        isHost,
        startQuiz,
        nextQuiz,
        prevQuiz,
        finishQuiz,
        pauseQuiz,
        resumeQuiz,
        jumpToQuestion,
        setAutoPlay,
        addEventListener
    ]);

    return (
        <QuizContext.Provider value={valueContext}>
            <QuizAnswersProvider yRoom={yRoom} isHost={isHost}>
                <RecordsProvider yRoom={yRoom} isHost={isHost}>
                    {children}
                </RecordsProvider>
            </QuizAnswersProvider>
        </QuizContext.Provider>
    );
}