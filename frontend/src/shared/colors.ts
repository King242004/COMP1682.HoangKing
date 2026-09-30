// Every color of the app lives here (see tai-lieu/Evenwise.md, section 8).
// Text colors are checked to have at least 4.5:1 contrast on the backgrounds they sit on.
const colors = {
  background: '#F3F6FB',
  card: '#FFFFFF',
  border: '#E2E8F0',

  text: '#0F172A',
  textMuted: '#475569',

  primary: '#1E3A8A',
  onPrimary: '#FFFFFF',

  expense: '#C62828',
  income: '#047857',

  warningBackground: '#FEF3C7',
  warningText: '#B45309',
  dangerBackground: '#FEE2E2',
  dangerText: '#B91C1C',

  group: '#7C3AED',

  // Light fills for future days on the calendar (dark text sits on them).
  upcomingExpenseBackground: '#E0E7FF',
  upcomingIncomeBackground: '#D1FAE5',
  groupBackground: '#EDE9FE',

  // Dark outline behind white text placed on top of a photo.
  photoTextShadow: 'rgba(0, 0, 0, 0.8)',
};

export default colors;
