import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';

const TimerPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { session } = location.state || {};

    const { loginId, buildNumber, numberOfParts, timePerPart } = session;
    const [remainingTime, setRemainingTime] = useState(numberOfParts * timePerPart * 60 || 0); // in seconds
    const [isPaused, setIsPaused] = useState(false);
    const [defects, setDefects] = useState(0);
    const timerRef = useRef(null);
    useEffect(() => {
    if (!isPaused) {
        if (timerRef.current) clearInterval(timerRef.current); // clear any existing interval first
        timerRef.current = setInterval(() => {
        setRemainingTime(prev => prev - 1);
        }, 1000);
    }

    return () => {
        clearInterval(timerRef.current);
    };
    }, [isPaused]);

    const formatTime = (seconds) => {
        console.log(remainingTime)
        const absSeconds = Math.abs(seconds);
        const h = String(Math.floor(absSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((absSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(absSeconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);

    const handleNext = () => {
        // Navigate to Final Submission, pass along defects, session data etc.
    };

    const isOverTime = remainingTime < 0;

    return (
        <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography variant="h4">Timer & Work Tracking</Typography>

        <Box sx={{ mt: 3, mb: 2 }}>
            <Typography>Login ID: {loginId}</Typography>
            <Typography>Build Number: {buildNumber}</Typography>
            <Typography>Number of Parts: {numberOfParts}</Typography>
            <Typography>Time per Part: {timePerPart} minutes</Typography>
        </Box>

        <Typography
            variant="h2"
            sx={{ color: isOverTime ? 'error.main' : 'text.primary', mb: 3 }}
        >
            {isOverTime ? '-' : ''}{formatTime(remainingTime)}
        </Typography>

        <Button variant="contained" sx={{ mr: 2 }} onClick={handlePause}>Pause</Button>

        <TextField
            label="Defects Encountered"
            type="number"
            value={defects}
            onChange={(e) => setDefects(Number(e.target.value))}
            sx={{ width: '150px', mx: 2 }}
        />

        <Button variant="outlined" onClick={handleNext}>Next</Button>

        <Modal open={isPaused}>
            <Box
            sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                p: 4,
                borderRadius: 2,
                boxShadow: 24,
                textAlign: 'center'
            }}
            >
            <Typography variant="h6" sx={{ mb: 2 }}>Paused</Typography>
            <Button variant="contained" onClick={handleResume}>Resume</Button>
            </Box>
        </Modal>
        </Box>
    );
};

export default TimerPage;
