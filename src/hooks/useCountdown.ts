import { useCallback, useEffect, useState } from "react";

export const MAX_OTP_COUNTDOWN = 60; // 1 minute

const useCountdown = (maxCountdown: number = MAX_OTP_COUNTDOWN) => {
  const [startCountdown, setStartCountdown] = useState(false);
  const [countdown, setCountdown] = useState(maxCountdown);

  const restartCountdown = useCallback(() => {
    setCountdown(maxCountdown);
    if (!startCountdown) {
      setStartCountdown(true);
    }
  }, [maxCountdown, startCountdown]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (startCountdown) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 0) {
            return prev - 1;
          }
          if (interval) clearInterval(interval);
          setStartCountdown(false);
          return 0;
        });
      }, 1000);
    } else {
      setCountdown(maxCountdown);
      clearInterval(interval);
    }
  }, [startCountdown, maxCountdown]);

  return {
    startCountdown,
    countdown,
    setCountdown,
    setStartCountdown,
    restartCountdown,
  };
};

export default useCountdown;
