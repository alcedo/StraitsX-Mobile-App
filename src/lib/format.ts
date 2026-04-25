export function formatMoney(amount: string | number | undefined, currency: string | undefined) {
  const numeric = Number(amount ?? 0);
  const displayCurrency = (currency ?? 'SGD').toUpperCase();

  if (!Number.isFinite(numeric)) {
    return `${displayCurrency} ${amount ?? '0.00'}`;
  }

  return `${displayCurrency} ${numeric.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value?: string) {
  if (!value) {
    return 'Pending';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function defaultStatementWindow() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 30);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}
