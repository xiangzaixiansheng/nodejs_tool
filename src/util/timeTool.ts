import dayjs from 'dayjs';

export function getCurTimeStamp(): number {
  return Math.round(Date.now() / 1000);
}

export function getBeforeDaysTmp(days: number = 2): number {
  return Math.round(dayjs().subtract(days, 'day').valueOf() / 1000);
}

export function formatTime(time: Date): string {
  return dayjs(time).format('YYYY-MM-DD');
}

export function getDate(time: Date): string {
  return dayjs(time).format('YYYY-MM-DD');
}
