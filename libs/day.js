import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
dayjs.extend(calendar);

export const bkkTime = dayStr => dayjs(dayStr).calendar();
export const displayTime = dayStr => dayjs(dayStr).format('HH:mm');
export const relativeTime = dayStr => {
  const now = dayjs();
  const target = dayjs(dayStr);
  const diff = (target - now) / 1000;
  if (diff < 0) {
    return 'Passed';
  }
  const min = diff / 60;
  if (min < 60) {
    return `${min.toFixed(0)} min`;
  }
  const hr = min / 60;
  return `${hr.toFixed(0)}:${(min % 60).toFixed(0)} hr`;
};
export const displayDatetime = dayStr =>
  dayjs(dayStr).format('MMMM DD, YYYY HH:mm');
export const minDuration = (d1, d2) => {
  const diff = (dayjs(d2) - dayjs(d1)) / 1000;
  return diff / 60; // min
};
