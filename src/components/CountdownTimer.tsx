import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate = '2026-11-20T23:59:59Z',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-2 bg-[#E5F4EC] text-[#1B4332] px-4 py-2.5 rounded-2xl border border-[#C7E4D6] text-xs font-bold">
        <Clock className="w-4 h-4 text-[#2D6A4F]" />
        <span>Registration Period Has Ended &bull; External draw in progress</span>
      </div>
    );
  }

  const items = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#2D6A4F] font-bold mb-3 font-sans">
        <Clock className="w-3.5 h-3.5" />
        <span>Entries Close In:</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 w-full max-w-sm">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-white border border-[#EBE4DA] rounded-2xl p-2 sm:p-3.5 shadow-sm"
          >
            <span className="text-xl sm:text-3xl font-extrabold text-[#24211D] font-serif tracking-tight">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs text-[#7A7067] uppercase tracking-wider font-semibold font-sans mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
