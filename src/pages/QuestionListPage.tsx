import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from "../services/storageService";
import { Question } from "../types";

const QuestionListPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState<string>("");
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = () => {
        const loadedQuestions = getQuestions();
        setQuestions(loadedQuestions);
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            addQuestion(newQuestion.trim());
            setNewQuestion("");
            loadQuestions();
        }
    };

    const handleEditClick = (question: Question) => {
        setEditingQuestion(question);
        setOpenDialog(true);
    };

    const handleUpdateQuestion = () => {
        if (editingQuestion && editingQuestion.text.trim()) {
            updateQuestion(editingQuestion.id, editingQuestion.text);
            setOpenDialog(false);
            loadQuestions();
        }
    };

    const handleDeleteQuestion = (id: string) => {
        if (window.confirm("정말 이 질문을 삭제하시겠습니까?")) {
            deleteQuestion(id);
            loadQuestions();
        }
    };

    return (
        <Container>
            <Box py={4}>
                <Typography variant='h4' component='h1' gutterBottom align='center'>
                    면접 질문 리스트
                </Typography>

                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Box display='flex'>
                        <TextField
                            fullWidth
                            label='새 면접 질문'
                            variant='outlined'
                            value={newQuestion}
                            onChange={(e) => setNewQuestion(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
                        />
                        <Button
                            variant='contained'
                            color='primary'
                            startIcon={<Add />}
                            onClick={handleAddQuestion}
                            sx={{ ml: 1, whiteSpace: "nowrap", minWIdth: "auto" }}>
                            추가
                        </Button>
                    </Box>
                </Paper>

                {questions.length === 0 ? (
                    <Typography variant='body1' align='center' color='textSecondary'>
                        등록된 질문이 없습니다. 위에서 새 질문을 추가해보세요.
                    </Typography>
                ) : (
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <List>
                            {questions.map((question) => (
                                <ListItem
                                    key={question.id}
                                    secondaryAction={
                                        <Box>
                                            <IconButton edge='end' aria-label='edit' onClick={() => handleEditClick(question)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton edge='end' aria-label='delete' onClick={() => handleDeleteQuestion(question.id)}>
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    }
                                    divider>
                                    <ListItemText primary={question.text} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                )}
            </Box>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>질문 수정</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin='dense'
                        label='질문'
                        type='text'
                        fullWidth
                        value={editingQuestion?.text || ""}
                        onChange={(e) => setEditingQuestion((prev) => (prev ? { ...prev, text: e.target.value } : null))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color='primary'>
                        취소
                    </Button>
                    <Button onClick={handleUpdateQuestion} color='primary'>
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QuestionListPage;
