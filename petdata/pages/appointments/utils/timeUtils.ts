// Constants for layout scaling
export const HOUR_HEIGHT = 100; // Height per hour in pixels
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60; // Height per minute in pixels

export const getTimePosition = (time: string, baseTime?: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const [baseHours, baseMinutes] = (baseTime || '00:00').split(':').map(Number);
  const totalMinutes = (hours - baseHours) * 60 + (minutes - baseMinutes);
  return totalMinutes * MINUTE_HEIGHT;
};

export const getBlockHeight = (startTime: string, endTime: string) => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const totalMinutes = (endHours - startHours) * 60 + (endMinutes - startMinutes);
  return totalMinutes * MINUTE_HEIGHT;
};
