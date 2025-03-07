// pages/RecordingsPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Typography, Box, List, ListItem, IconButton, Paper, Divider, Card, CardContent, CardActions } from "@mui/material";
import { Delete, PlayArrow, Pause } from "@mui/icons-material";
import { getRecordings, getQuestions, deleteRecording } from "../services/storageService";
import { Recording, Question, RecordingGroupByDate } from "../types";

const RecordingsPage: React.FC = () => {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [questions, setQuestions] = useState<{ [key: string]: Question }>({});
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        loadData();

        // 오디오 요소 생성
        const audio = new Audio();
        audio.onended = () => setPlayingId(null);

        // iOS Safari를 위한 추가 설정
        audio.controls = true; // 내부적으로만 사용됨
        audio.preload = "metadata"; // 성능 개선

        // 오류 처리 추가
        audio.onerror = (e) => {
            console.error("오디오 오류:", e);
            setPlayingId(null);
            // alert("오디오 재생 중 오류가 발생했습니다.");
        };

        audioRef.current = audio;

        return () => {
            if (audio) {
                audio.pause();
                audio.src = "";
            }
        };
    }, []);

    const loadData = () => {
        // 녹음 데이터 로드
        const recordingsData = getRecordings();
        setRecordings(recordingsData);

        // 질문 데이터를 ID로 색인화
        const questionsData = getQuestions();
        const questionsMap: { [key: string]: Question } = {};
        questionsData.forEach((q) => {
            questionsMap[q.id] = q;
        });
        setQuestions(questionsMap);
    };

    const handlePlayRecording = async (recording: Recording) => {
        if (!audioRef.current) return;

        if (playingId === recording.id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            if (playingId && audioRef.current) {
                audioRef.current.pause();
            }

            audioRef.current.src = recording.audio;
            audioRef.current.load();

            try {
                await audioRef.current.play();
                setPlayingId(recording.id);
            } catch (error) {
                console.error("오디오 재생 실패:", error);
                // alert("오디오 재생에 실패했습니다. 브라우저가 이 오디오 형식을 지원하지 않을 수 있습니다.");
            }

            audioRef.current.play();
            setPlayingId(recording.id);
        }
    };

    const handleDeleteRecording = (id: string) => {
        if (window.confirm("정말 이 녹음을 삭제하시겠습니까?")) {
            if (playingId === id && audioRef.current) {
                audioRef.current.pause();
                setPlayingId(null);
            }

            deleteRecording(id);
            loadData();
        }
    };

    // 날짜별로 녹음 그룹화
    const groupRecordingsByDate = (): RecordingGroupByDate[] => {
        const groups: { [key: string]: Recording[] } = {};

        recordings.forEach((recording) => {
            const date = new Date(recording.createdAt).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(recording);
        });

        // 날짜별로 정렬 (최신순)
        return Object.keys(groups)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((date) => ({
                date,
                recordings: groups[date].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            }));
    };

    const groupedRecordings = groupRecordingsByDate();

    return (
        <Container maxWidth='md'>
            <Box py={4}>
                <Typography variant='h4' component='h1' gutterBottom align='center'>
                    녹음 기록
                </Typography>

                {recordings.length === 0 ? (
                    <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
                        <Typography variant='body1' color='textSecondary'>
                            저장된 녹음이 없습니다. 랜덤 면접 질문 페이지에서 녹음해보세요.
                        </Typography>
                    </Paper>
                ) : (
                    <Box>
                        {groupedRecordings.map((group) => (
                            <Box key={group.date} mb={4}>
                                <Typography variant='h6' gutterBottom>
                                    {group.date}
                                </Typography>

                                <Paper elevation={3}>
                                    <List>
                                        {group.recordings.map((recording, index) => (
                                            <React.Fragment key={recording.id}>
                                                {index > 0 && <Divider component='li' />}
                                                <ListItem>
                                                    <Card sx={{ width: "100%" }}>
                                                        <CardContent>
                                                            <Typography variant='subtitle1' gutterBottom>
                                                                질문: {questions[recording.questionId]?.text || "(삭제된 질문)"}
                                                            </Typography>
                                                            <Typography variant='body2' color='textSecondary'>
                                                                {new Date(recording.createdAt).toLocaleTimeString()}
                                                            </Typography>
                                                        </CardContent>
                                                        <CardActions>
                                                            <IconButton
                                                                color={playingId === recording.id ? "secondary" : "primary"}
                                                                onClick={() => handlePlayRecording(recording)}>
                                                                {playingId === recording.id ? <Pause /> : <PlayArrow />}
                                                            </IconButton>
                                                            <IconButton color='error' onClick={() => handleDeleteRecording(recording.id)}>
                                                                <Delete />
                                                            </IconButton>
                                                        </CardActions>
                                                    </Card>
                                                </ListItem>
                                            </React.Fragment>
                                        ))}
                                    </List>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default RecordingsPage;
