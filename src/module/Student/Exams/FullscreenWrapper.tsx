import React, { useState, useCallback, useEffect } from 'react';

interface FullscreenWrapperProps {
  children: React.ReactNode;
  onViolation: (reason: string) => void;
}

const FullscreenWrapper: React.FC<FullscreenWrapperProps> = ({
  children,
  onViolation,
}) => {
  const [isFs, setIsFs] = useState(false);
  const [forced, setForced] = useState(false);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement) {
      onViolation('Fullscreen exited');
      setForced(true);
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      setIsFs(true);
      setForced(false);
    }
  }, [onViolation]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      onViolation('Tab switched');
    }
  }, [onViolation]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleFullscreenChange, handleVisibilityChange]);

  useEffect(() => {
    if (forced) {
      const timer = setInterval(() => {
        document.documentElement.requestFullscreen().catch(() => {});
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [forced]);

  if (!isFs) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <button
          onClick={() => document.documentElement.requestFullscreen()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Click to Start Exam (Fullscreen)
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default FullscreenWrapper;
