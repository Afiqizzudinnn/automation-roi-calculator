/**
 * The ROI maths. Pure functions with no page code, so they can be read and tested on their own.
 */

export const HOURS_PER_DAY = 8;
export const WEEKS_PER_MONTH = 52 / 12;
const MONTHS_PER_YEAR = 12;
const MINUTES_PER_HOUR = 60;

/**
 * Works out what automating one task saves.
 * @param {{
 *   manual: number, auto: number,       minutes per task now and after automation
 *   freq: number, unit: 'day'|'week'|'month',   how often each person does it
 *   staff: number, salary: number, days: number, build: number
 * }} task
 * @returns {{
 *   hoursNow: number, hoursAfter: number,   team hours a month on the task
 *   hoursYear: number, moneyYear: number, fte: number,
 *   cut: number,                             share of time saved per task, 0 to 1
 *   paybackMonths: number | null            null with no build cost, Infinity when nothing is saved
 * }}
 */
export function calculate({ manual, auto, freq, unit, staff, salary, days, build }) {
  const timesPerMonth = { day: days, week: WEEKS_PER_MONTH, month: 1 }[unit];
  const tasksPerMonth = freq * timesPerMonth * staff;
  const minutesSaved = Math.max(manual - auto, 0);
  const workHoursPerMonth = days * HOURS_PER_DAY;

  const hoursNow = (manual * tasksPerMonth) / MINUTES_PER_HOUR;
  const hoursAfter = (Math.min(auto, manual) * tasksPerMonth) / MINUTES_PER_HOUR;
  const hoursMonth = (minutesSaved * tasksPerMonth) / MINUTES_PER_HOUR;
  const hoursYear = hoursMonth * MONTHS_PER_YEAR;
  const moneyYear = hoursYear * (salary / workHoursPerMonth);

  let paybackMonths = null;
  if (build > 0) paybackMonths = moneyYear > 0 ? build / (moneyYear / MONTHS_PER_YEAR) : Infinity;

  return {
    hoursNow,
    hoursAfter,
    hoursYear,
    moneyYear,
    fte: hoursMonth / workHoursPerMonth,
    cut: manual ? minutesSaved / manual : 0,
    paybackMonths,
  };
}
