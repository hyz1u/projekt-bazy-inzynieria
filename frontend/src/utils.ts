export const STATUS_MAP: Record<string, string> = {
  STABLE: 'Stabilny',
  IMPROVING: 'Poprawa',
  POST_OP: 'Po zabiegu',
  AWAITING_TESTS: 'Oczekuje na badania',
  CRITICAL: 'Krytyczny',
};


export const formatDateTime = (isoDateString: string): string => {
  const date = new Date(isoDateString);
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};