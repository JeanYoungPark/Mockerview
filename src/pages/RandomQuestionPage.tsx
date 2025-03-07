// pages/RandomQuestionPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert, Snackbar } from "@mui/material";
import { PlayArrow, Mic, Stop, Replay } from "@mui/icons-material";
import { getRandomQuestion, getQuestions, addRecording } from "../services/storageService";
import { Question } from "../types";

const RandomQuestionPage: React.FC = () => {
    const utteranceRef = useRef(new SpeechSynthesisUtterance());
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAsking, setIsAsking] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string>("");

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

        if (questions.length === 0) {
            showMessage("질문이 없습니다. 먼저 질문을 추가해주세요.");
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
        window.speechSynthesis.cancel();
        utteranceRef.current.text = currentQuestion.text;
        utteranceRef.current.lang = "ko-KR";

        utteranceRef.current.onend = () => {
            setIsAsking(false);
        };

        window.speechSynthesis.speak(utteranceRef.current);
    };

    const stopSpeakQuestion = () => {
        if (!currentQuestion) return;
        setIsAsking(false);

        // 음성 중지
        window.speechSynthesis.cancel();
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // MediaRecorder 지원 여부 확인
            if (!window.MediaRecorder) {
                showMessage("이 브라우저는 녹음 기능을 지원하지 않습니다.");
                return;
            }

            // 브라우저가 지원하는 MIME 타입 확인
            let mimeType = "audio/webm";
            if (MediaRecorder.isTypeSupported("audio/mp4")) {
                mimeType = "audio/mp4";
            } else if (MediaRecorder.isTypeSupported("audio/webm")) {
                mimeType = "audio/webm";
            } else {
                // 기본 MIME 타입 사용 (브라우저가 결정)
                mimeType = "";
            }

            const options = mimeType ? { mimeType } : undefined;
            const recorder = new MediaRecorder(stream, options);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const audioBlob = new Blob(chunks, { type: mimeType });
                console.log("audioBlob:", audioBlob);
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

    const handleStopActionClick = () => {
        if (isAsking && !isRecording) {
            stopSpeakQuestion();
        }
    };

    const handleRecordClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    useEffect(() => {
        speakQuestion();
    }, [currentQuestion]);

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
                                    onClick={isAsking ? handleStopActionClick : handleActionClick}
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

                                <Button variant='outlined' startIcon={<Replay />} onClick={fetchRandomQuestion} disabled={isAsking || isRecording}>
                                    다음 질문
                                </Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>

            <Snackbar open={snackbarOpen} autoHideDuration={6000}>
                <Alert onClose={() => setSnackbarOpen(false)} severity='info' sx={{ width: "100%" }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RandomQuestionPage;
