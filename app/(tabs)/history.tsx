import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, EmptyState, Field, Screen, palette } from '@/src/components/wallet-ui';
import { defaultStatementWindow, formatDate, formatMoney } from '@/src/lib/format';
import { getAccountStatement } from '@/src/lib/straitsx/statements';
import { StatementEntry } from '@/src/lib/straitsx/types';
import { useAppState } from '@/src/state/app-state';

function toTitleCase(value: string) {
  return value
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function TransactionRow({ entry, isLast }: { entry: StatementEntry; isLast: boolean }) {
  const isCredit = entry.attributes.creditDebitIndicator === 'Credit';
  const icon = isCredit ? 'south-west' : 'north-east';
  const title = toTitleCase(entry.attributes.type);
  const status = toTitleCase(entry.attributes.status);

  return (
    <View style={[styles.transactionRow, isLast && styles.lastTransactionRow]}>
      <View style={styles.transactionIcon}>
        <MaterialIcons name={icon} size={22} color={palette.brand} />
      </View>

      <View style={styles.transactionBody}>
        <Text style={styles.transactionTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.transactionDetail} numberOfLines={1}>
          {status} • {formatDate(entry.attributes.createdAt)}
        </Text>
      </View>

      <Text style={styles.transactionValue} numberOfLines={1}>
        {formatMoney(entry.attributes.amount, entry.attributes.currency)}
      </Text>
    </View>
  );
}

const PAGE_SIZE = 50;

export default function HistoryScreen() {
  const { client, data, hasApiKey, selectedAsset } = useAppState();
  const [currency, setCurrency] = useState(selectedAsset);
  const [entries, setEntries] = useState(data.statements);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);

  function computeHasMore(page: number, response: Awaited<ReturnType<typeof getAccountStatement>>) {
    if (typeof response.meta?.pages === 'number') {
      return page < response.meta.pages;
    }
    return response.data.length === PAGE_SIZE;
  }

  async function loadFirstPage() {
    setLoading(true);
    setError(null);

    try {
      const window = defaultStatementWindow();
      const response = await getAccountStatement(client, {
        currency,
        ...window,
        pageSize: PAGE_SIZE,
        pageNumber: 1,
      });
      setEntries(response.data);
      setRange(window);
      setPageNumber(1);
      setHasMore(computeHasMore(1, response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load history.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!range || !hasMore) return;
    setLoadingMore(true);
    setError(null);

    const nextPage = pageNumber + 1;
    try {
      const response = await getAccountStatement(client, {
        currency,
        ...range,
        pageSize: PAGE_SIZE,
        pageNumber: nextPage,
      });
      setEntries((prev) => [...prev, ...response.data]);
      setPageNumber(nextPage);
      setHasMore(computeHasMore(nextPage, response));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load more history.');
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <Screen title="History">
      <View style={styles.filterCard}>
        <Field label="Currency" value={currency} onChangeText={(value) => setCurrency(value.toLowerCase())} />
        <Button disabled={!hasApiKey} loading={loading} onPress={loadFirstPage} icon="history">
          Load 30 days
        </Button>
      </View>

      {entries.length === 0 ? (
        <EmptyState title="No transactions loaded" detail="Account statement entries appear here after a sandbox API refresh." />
      ) : (
        <>
          <View style={styles.transactionCard}>
            {entries.map((entry, index) => (
              <TransactionRow
                key={entry.id}
                entry={entry}
                isLast={index === entries.length - 1}
              />
            ))}
          </View>

          {hasMore ? (
            <View style={styles.loadMoreContainer}>
              <Button variant="secondary" loading={loadingMore} onPress={loadMore} icon="expand-more">
                Load more
              </Button>
            </View>
          ) : null}
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: palette.surface,
    borderColor: '#E4EAF0',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 14,
    padding: 18,
    shadowColor: '#101820',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
  },
  transactionCard: {
    backgroundColor: palette.surface,
    borderColor: '#E4EAF0',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#101820',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 18,
  },
  transactionRow: {
    alignItems: 'center',
    borderBottomColor: '#E8EEF2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 84,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  lastTransactionRow: {
    borderBottomWidth: 0,
  },
  transactionIcon: {
    alignItems: 'center',
    backgroundColor: palette.brandSoft,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  transactionBody: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  transactionTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0,
  },
  transactionDetail: {
    color: palette.muted,
    fontSize: 13,
    letterSpacing: 0,
  },
  transactionValue: {
    color: palette.ink,
    flexShrink: 0,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
    maxWidth: '40%',
    textAlign: 'right',
  },
  loadMoreContainer: {
    marginTop: 12,
  },
  error: {
    color: palette.coral,
    paddingHorizontal: 16,
  },
});
