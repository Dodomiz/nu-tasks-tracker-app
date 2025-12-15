export function formatDate(date: Date | string, locale: string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const fmt = new Intl.DateTimeFormat(locale || 'en', options || { year: 'numeric', month: 'short', day: 'numeric' });
  return fmt.format(d);
}

export function formatRelative(from: Date | string, to: Date | string = new Date(), locale: string = 'en') {
  const start = typeof from === 'string' ? new Date(from) : from;
  const end = typeof to === 'string' ? new Date(to) : to;
  const diff = (end.getTime() - start.getTime()) / 1000; // seconds
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (abs < 60) return rtf.format(Math.round(diff), 'seconds');
  const minutes = diff / 60;
  if (Math.abs(minutes) < 60) return rtf.format(Math.round(minutes), 'minutes');
  const hours = minutes / 60;
  if (Math.abs(hours) < 24) return rtf.format(Math.round(hours), 'hours');
  const days = hours / 24;
  return rtf.format(Math.round(days), 'days');
}
