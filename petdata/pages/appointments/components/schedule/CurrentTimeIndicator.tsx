import React from 'react';
import { getTimePosition } from '../../utils/timeUtils';

interface CurrentTimeIndicatorProps {
  scheduleStartTime: string;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  scheduleStartTime,
}) => {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [position, setPosition] = React.useState(
    getTimePosition(getCurrentTime(), scheduleStartTime)
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPosition(getTimePosition(getCurrentTime(), scheduleStartTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [scheduleStartTime]);

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
      style={{ top: position }}
    >
      <div className="absolute -left-3 -top-1.5 w-3 h-3 rounded-full bg-red-500" />
    </div>
  );
};
