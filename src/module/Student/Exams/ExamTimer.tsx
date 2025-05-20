import React, { useEffect, useState } from 'react';

interface ExamTimerProps {
  timeLeft: number;
  flags: number;
  onTimeout: () => void;
}

const ExamTimer: React.FC<ExamTimerProps> = ({
  timeLeft,
  flags,
  onTimeout,
}) => {
  const [remaining, setRemaining] = useState(timeLeft);

  useEffect(() => {
    setRemaining(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1000) {
          onTimeout();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeout]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">
          Time Remaining: {formatTime(remaining)}
        </div>
        <div className="text-red-400">Violations: {flags}/3</div>
      </div>
    </div>
  );
};

export default ExamTimer;
