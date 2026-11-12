// The sun over Oranjestad, worked out from the date with NOAA's solar equations (to about a minute), so the first
// view can say what the light is doing in Aruba right now. No data comes from anywhere: it is arithmetic.

/** Oranjestad. Aruba keeps Atlantic Standard Time (UTC-4) all year, with no daylight saving. */
const LAT = 12.5186;
const LNG = -70.0358;
const UTC_OFFSET_MIN = -4 * 60;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Aruba's wall clock for an instant: the date parts and minutes since midnight. */
export function arubaClock(at: Date) {
  const local = new Date(at.getTime() + UTC_OFFSET_MIN * 60_000);
  return {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth(),
    day: local.getUTCDate(),
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  };
}

/** Sunrise and sunset in Oranjestad on a calendar day, as minutes after midnight, Aruba time. */
export function sunTimes(year: number, month: number, day: number) {
  const start = Date.UTC(year, 0, 1);
  const n = Math.round((Date.UTC(year, month, day) - start) / 86_400_000) + 1;
  const daysInYear = (Date.UTC(year + 1, 0, 1) - start) / 86_400_000;
  const g = ((2 * Math.PI) / daysInYear) * (n - 1);
  const eqTime =
    229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl =
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g);
  // The sun's centre 0.833° under the horizon: refraction and the sun's own radius.
  const cosHa = Math.cos(rad(90.833)) / (Math.cos(rad(LAT)) * Math.cos(decl)) - Math.tan(rad(LAT)) * Math.tan(decl);
  const ha = deg(Math.acos(Math.min(1, Math.max(-1, cosHa))));
  const toLocal = (utcMin: number) => Math.round(utcMin + UTC_OFFSET_MIN);
  return { rise: toLocal(720 - 4 * (LNG + ha) - eqTime), set: toLocal(720 - 4 * (LNG - ha) - eqTime) };
}

/** 6:41 AM, the way the rest of the site writes times. */
export function clockText(minutes: number) {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
}

export type Daypart = 'night' | 'dawn' | 'day' | 'golden' | 'dusk';

/** The light outside right now, and one line about the sun, for an instant. */
export function sunNow(at: Date) {
  const { year, month, day, minutes } = arubaClock(at);
  const { rise, set } = sunTimes(year, month, day);
  let part: Daypart = 'night';
  if (minutes >= rise - 40 && minutes < rise + 50) part = 'dawn';
  else if (minutes >= rise + 50 && minutes < set - 70) part = 'day';
  else if (minutes >= set - 70 && minutes < set) part = 'golden';
  else if (minutes >= set && minutes < set + 35) part = 'dusk';
  const up = minutes >= rise && minutes < set;
  let line: string;
  if (up) line = `Sun up until ${clockText(set)}`;
  else if (minutes < rise) line = `Sunrise at ${clockText(rise)}`;
  else {
    const next = new Date(Date.UTC(year, month, day + 1));
    line = `Sunrise at ${clockText(sunTimes(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate()).rise)}`;
  }
  return { time: clockText(minutes), line, part, up };
}
