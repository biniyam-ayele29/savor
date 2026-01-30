import { useState, useEffect } from 'react';
import { differenceInSeconds, parseISO } from 'date-fns';

export function useOrderTimer(createdAt: string) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const startDate = parseISO(createdAt);

        const updateTimer = () => {
            const now = new Date();
            setSeconds(differenceInSeconds(now, startDate));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return { seconds, formatTime: formatTime() };
}
