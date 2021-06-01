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
  if (min <= 60) {
    return `${min.toFixed(0)} min`;
  }
  const hr = Math.floor(min / 60);
  const leftoverMin = Math.floor(min % 60);
  const minText = leftoverMin > 9 ? leftoverMin : `0${leftoverMin.toFixed(0)}`;
  return `${hr.toFixed(0)}:${minText} hr`;
};
export const displayDatetime = dayStr =>
  dayjs(dayStr).format('MMMM DD, YYYY HH:mm');

export const minDuration = (d1, d2) => {
  const diff = (dayjs(d2) - dayjs(d1)) / 1000;
  return Math.floor(diff / 60); // min
};

export const hhmmDuration = (d1, d2) => {
  const diff = (dayjs(d2) - dayjs(d1)) / 1000;
  let hour = Math.floor(diff / 3600); // hour
  let min = Math.floor((diff - hour * 3600)/60)
  let sec = Math.floor((diff - hour * 3600 - min* 60))
  const minText = min > 9 ? min : `0${min.toFixed(0)}`;
  const secText = sec > 9 ? sec : `0${sec.toFixed(0)}`;
  return `${hour}:${minText}:${secText}`
}

export const getToday = () => dayjs().subtract(3, 'hour').format('YYYY-MM-DDTHH:mm:ssZ');
