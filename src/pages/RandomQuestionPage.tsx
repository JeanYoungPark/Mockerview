// pages/RandomQuestionPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert, Snackbar } from "@mui/material";
import { PlayArrow, Mic, Stop, Replay } from "@mui/icons-material";
import { getRandomQuestion, getQuestions, addRecording } from "../services/storageService";
import { Question } from "../types";

const RandomQuestionPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAsking, setIsAsking] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // 음성 합성 API 초기화
        if (!window.speechSynthesis) {
            showMessage("음성 합성 기능이 지원되지 않는 브라우저입니다.");
        }
    }, []);

    const showMessage = (message: string) => {
        setSnackbarMessage(message);
        setSnackbarOpen(true);
    };

    const fetchRandomQuestion = () => {
        setIsLoading(true);

        const questions = getQuestions();
        console.log(questions.length);
        if (questions.length === 0) {
            showMessage("질문이 없습니다. 먼저 질문을 추가해주세요.");
            navigate("/");
            setIsLoading(false);
            return;
        }

        const question = getRandomQuestion();
        setCurrentQuestion(question);
        setIsLoading(false);
    };

    const speakQuestion = () => {
        if (!currentQuestion) return;

        setIsAsking(true);

        // 음성 합성 사용
        const utterance = new SpeechSynthesisUtterance(currentQuestion.text);
        utterance.lang = "ko-KR"; // 한국어로 설정

        utterance.onend = () => {
            setIsAsking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: "audio/webm" });

                try {
                    if (currentQuestion) {
                        await addRecording(currentQuestion.id, audioBlob);
                        showMessage("녹음이 저장되었습니다!");
                    }
                } catch (error) {
                    console.error("Error saving recording:", error);
                    showMessage("녹음 저장 중 오류가 발생했습니다.");
                }

                stream.getTracks().forEach((track) => track.stop());
            };

            setMediaRecorder(recorder);
            setRecordedChunks(chunks);

            recorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            showMessage("마이크 접근에 실패했습니다. 권한을 확인해주세요.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const handleActionClick = () => {
        if (!currentQuestion) {
            fetchRandomQuestion();
        } else if (!isAsking && !isRecording) {
            speakQuestion();
        }
    };

    const handleRecordClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleNextQuestion = () => {
        setCurrentQuestion(null);
    };

    return (
        <Container maxWidth='md'>
            <Box py={4} display='flex' flexDirection='column' alignItems='center'>
                <Typography variant='h4' component='h1' gutterBottom align='center'>
                    랜덤 면접 질문
                </Typography>

                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: "100%",
                        minHeight: "200px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                    {isLoading ? (
                        <CircularProgress />
                    ) : !currentQuestion ? (
                        <>
                            <Typography variant='body1' gutterBottom align='center'>
                                '질문하기' 버튼을 클릭하여 랜덤 면접 질문을 시작하세요.
                            </Typography>
                            <Button
                                variant='contained'
                                color='primary'
                                startIcon={<PlayArrow />}
                                onClick={handleActionClick}
                                size='large'
                                sx={{ mt: 2 }}>
                                질문하기
                            </Button>
                        </>
                    ) : (
                        <>
                            <Box mb={4} width='100%'>
                                <Typography variant='h5' gutterBottom align='center'>
                                    {currentQuestion.text}
                                </Typography>
                            </Box>

                            <Box display='flex' justifyContent='center' gap={2}>
                                <Button
                                    variant='contained'
                                    color={isAsking ? "secondary" : "primary"}
                                    startIcon={isAsking ? <Stop /> : <PlayArrow />}
                                    onClick={handleActionClick}
                                    disabled={isRecording}>
                                    {isAsking ? "듣기 중지" : "다시 듣기"}
                                </Button>

                                <Button
                                    variant='contained'
                                    color={isRecording ? "error" : "success"}
                                    startIcon={isRecording ? <Stop /> : <Mic />}
                                    onClick={handleRecordClick}
                                    disabled={isAsking}>
                                    {isRecording ? "녹음 중지" : "녹음하기"}
                                </Button>

                                <Button variant='outlined' startIcon={<Replay />} onClick={handleNextQuestion} disabled={isAsking || isRecording}>
                                    다음 질문
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity='info' sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RandomQuestionPage;
