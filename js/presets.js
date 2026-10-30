/** Example tasks for the preset buttons. The numbers are typical, made-up office figures. */

export const DEFAULT_PRESET = 'invoice';

export const PRESETS = {
  invoice: {
    name: 'Typing supplier invoices into the system',
    manual: 6, auto: 1, freq: 40, unit: 'day', staff: 2, salary: 3500, days: 22, build: 3000, currency: 'RM',
  },
  email: {
    name: 'Logging email requests into an Excel tracker',
    manual: 3, auto: 0.5, freq: 50, unit: 'day', staff: 3, salary: 3200, days: 22, build: 1500, currency: 'RM',
  },
  report: {
    name: 'Building the weekly sales report',
    manual: 180, auto: 10, freq: 2, unit: 'week', staff: 1, salary: 4500, days: 22, build: 2000, currency: 'RM',
  },
};
