/**
 * Page code for the Automation ROI Calculator: read the inputs, run the maths and show the result.
 * The maths itself lives in roi.js.
 */
import { DEFAULT_PRESET, PRESETS } from './presets.js';
import { calculate, WEEKS_PER_MONTH } from './roi.js';

const DEFAULT_WORKING_DAYS = 22;
const COPIED_MESSAGE_MS = 2000;
const NUMBER_FIELDS = ['manual', 'auto', 'freq', 'staff', 'salary', 'days', 'build'];

const $ = (selector) => document.querySelector(selector);

const el = {
  inputs: Object.fromEntries(['name', ...NUMBER_FIELDS].map((field) => [field, $(`#${field}`)])),
  unit: $('#unit'),
  currency: $('#currency'),
  presets: $('#presets'),
  hours: $('#result-hours'),
  summary: $('#result-summary'),
  copy: $('#copy'),
  copied: $('#copied'),
  warning: $('#warning'),
  breakdownTitle: $('#breakdown-title'),
  money: $('#money'),
  fte: $('#fte'),
  cut: $('#cut'),
  payback: $('#payback'),
  barNow: $('#bar-now'),
  barAfter: $('#bar-after'),
  hoursNow: $('#hours-now'),
  hoursAfter: $('#hours-after'),
};

const formatNumber = (n, digits = 0) => n.toLocaleString('en-MY', { minimumFractionDigits: digits, maximumFractionDigits: digits });
const formatMinutes = (n) => formatNumber(n, n % 1 ? 1 : 0);
const numberFrom = (input) => Math.max(0, Number.parseFloat(input.value) || 0);

function formatPayback(months) {
  if (months === null) return '-';
  if (!Number.isFinite(months)) return 'never';
  return months < 1 ? `${Math.max(1, Math.round(months * WEEKS_PER_MONTH))} weeks` : `${formatNumber(months, 1)} months`;
}

// ---------- Segmented controls and presets ----------

const segmentedValue = (group) => group.querySelector('[aria-checked="true"]').dataset.value;

function setSegmented(group, value) {
  group.querySelectorAll('button').forEach((button) => button.setAttribute('aria-checked', String(button.dataset.value === value)));
}

function markPreset(key) {
  el.presets.querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.preset === key)));
}

function applyPreset(key) {
  const preset = PRESETS[key];
  Object.entries(el.inputs).forEach(([field, input]) => { input.value = preset[field]; });
  setSegmented(el.unit, preset.unit);
  setSegmented(el.currency, preset.currency);
  markPreset(key);
  update();
}

// ---------- Calculating and rendering ----------

function readTask() {
  const numbers = Object.fromEntries(NUMBER_FIELDS.map((field) => [field, numberFrom(el.inputs[field])]));
  return {
    ...numbers,
    days: numbers.days || DEFAULT_WORKING_DAYS,
    name: el.inputs.name.value.trim() || 'this task',
    unit: segmentedValue(el.unit),
    currency: segmentedValue(el.currency),
  };
}

function summaryText(task, result) {
  const hours = formatNumber(result.hoursYear);
  const money = `${task.currency} ${formatNumber(result.moneyYear)}`;
  const payback = Number.isFinite(result.paybackMonths)
    ? ` The ${task.currency} ${formatNumber(task.build)} build cost pays for itself in about ${formatPayback(result.paybackMonths)}.`
    : '';
  return `Automating "${task.name}" would save about ${hours} hours and ${money} in salary cost a year, `
    + `the same as ${formatNumber(result.fte, 1)} full-time staff. `
    + `Each task drops from ${formatMinutes(task.manual)} min to ${formatMinutes(task.auto)} min (${formatNumber(result.cut * 100)}% less time).`
    + `${payback} (Estimate, salary cost only.)`;
}

function update() {
  const task = readTask();
  const result = calculate(task);
  const hours = formatNumber(result.hoursYear);

  el.hours.textContent = hours;
  el.summary.textContent = summaryText(task, result);
  el.warning.hidden = task.auto <= task.manual;

  el.breakdownTitle.textContent = `What ${hours} hours a year is worth`;
  el.money.textContent = `${task.currency} ${formatNumber(result.moneyYear)}`;
  el.fte.textContent = formatNumber(result.fte, result.fte > 0 && result.fte < 0.1 ? 2 : 1);
  el.cut.textContent = `${formatNumber(result.cut * 100)}%`;
  el.payback.textContent = formatPayback(result.paybackMonths);

  const scale = Math.max(result.hoursNow, 1);
  el.barNow.style.width = `${(result.hoursNow / scale) * 100}%`;
  el.barAfter.style.width = `${(result.hoursAfter / scale) * 100}%`;
  el.hoursNow.textContent = `${formatNumber(result.hoursNow)} h`;
  el.hoursAfter.textContent = `${formatNumber(result.hoursAfter)} h`;
}

// ---------- Copy ----------

async function copySummary() {
  const text = el.summary.textContent;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Older browsers, or a page without clipboard permission: select the text and copy it.
    const range = document.createRange();
    range.selectNodeContents(el.summary);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
  }
  el.copied.hidden = false;
  setTimeout(() => { el.copied.hidden = true; }, COPIED_MESSAGE_MS);
}

// ---------- Start ----------

function init() {
  Object.values(el.inputs).forEach((input) => input.addEventListener('input', () => {
    markPreset(null);
    update();
  }));
  [el.unit, el.currency].forEach((group) => group.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    setSegmented(group, button.dataset.value);
    markPreset(null);
    update();
  }));
  el.presets.addEventListener('click', (event) => {
    const button = event.target.closest('[data-preset]');
    if (button) applyPreset(button.dataset.preset);
  });
  el.copy.addEventListener('click', copySummary);

  applyPreset(DEFAULT_PRESET);
}

init();
