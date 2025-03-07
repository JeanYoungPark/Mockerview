// components/Layout.tsx
import React, { useState, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    Theme,
    ListItemButton,
} from "@mui/material";
import { Menu as MenuIcon, FormatListBulleted, QuestionAnswer, MicNone } from "@mui/icons-material";

interface LayoutProps {
    children: ReactNode;
}

interface MenuItem {
    text: string;
    icon: React.ReactElement;
    path: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

    const [drawerOpen, setDrawerOpen] = useState(false);

    const menuItems: MenuItem[] = [
        { text: "질문 리스트", icon: <FormatListBulleted />, path: "/" },
        { text: "랜덤 질문", icon: <QuestionAnswer />, path: "/random" },
        { text: "녹음 기록", icon: <MicNone />, path: "/recordings" },
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        setDrawerOpen(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100vw" }}>
            <AppBar position='static'>
                <Toolbar>
                    {isMobile && (
                        <IconButton edge='start' color='inherit' aria-label='menu' onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                        Mockerview
                    </Typography>

                    {!isMobile && (
                        <Box>
                            {menuItems.map((item) => (
                                <Button
                                    key={item.text}
                                    color='inherit'
                                    startIcon={item.icon}
                                    onClick={() => handleNavigate(item.path)}
                                    sx={{
                                        mx: 1,
                                        fontWeight: location.pathname === item.path ? "bold" : "normal",
                                        borderRadius: 0,
                                        borderBottom: location.pathname === item.path ? "2px solid white" : "none",
                                    }}>
                                    {item.text}
                                </Button>
                            ))}
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Drawer anchor='left' open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box sx={{ width: 250 }} role='presentation'>
                    <List>
                        {menuItems.map((item) => (
                            <ListItemButton key={item.text} onClick={() => handleNavigate(item.path)} selected={location.pathname === item.path}>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            </Drawer>

            <Box component='main' sx={{ flexGrow: 1, bgcolor: "background.default" }}>
                {children}
            </Box>

            <Box component='footer' sx={{ py: 3, bgcolor: "background.paper", textAlign: "center" }}>
                <Typography variant='body2' color='text.secondary'>
                    © {new Date().getFullYear()} 면접 연습 앱
                </Typography>
            </Box>
        </Box>
    );
};

export default Layout;
