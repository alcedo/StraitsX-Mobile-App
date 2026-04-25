import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const palette = {
  ink: '#101820',
  muted: '#667085',
  faint: '#8A94A6',
  line: '#DEE5EA',
  canvas: '#F5F7F8',
  surface: '#FFFFFF',
  brand: '#005B4F',
  brandSoft: '#D9F3EA',
  coral: '#E56045',
  blue: '#2F6FED',
  gold: '#B9862C',
};

export function Screen({ children, title, action }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {action}
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Card({ children, tone = 'surface' }: PropsWithChildren<{ tone?: 'surface' | 'dark' | 'soft' }>) {
  return <View style={[styles.card, tone === 'dark' && styles.darkCard, tone === 'soft' && styles.softCard]}>{children}</View>;
}

export function Row({
  icon,
  title,
  detail,
  value,
  onPress,
}: {
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper style={({ pressed }: { pressed?: boolean }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
      {icon ? (
        <View style={styles.iconBubble}>
          <MaterialIcons name={icon} size={20} color={palette.brand} />
        </View>
      ) : null}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {onPress ? <MaterialIcons name="chevron-right" size={22} color={palette.faint} /> : null}
    </Wrapper>
  );
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: PropsWithChildren<{
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
}>) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[`${variant}Button`],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? <ActivityIndicator color={variant === 'primary' ? '#fff' : palette.brand} /> : null}
      {!loading && icon ? <MaterialIcons name={icon} size={18} color={variant === 'primary' ? '#fff' : palette.brand} /> : null}
      <Text style={[styles.buttonText, variant === 'primary' || variant === 'danger' ? styles.primaryButtonText : null]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.faint}
        autoCapitalize="none"
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function Pill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'success' | 'warning' }>) {
  return (
    <View style={[styles.pill, tone === 'success' && styles.successPill, tone === 'warning' && styles.warningPill]}>
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <Card>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0,
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  darkCard: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  softCard: {
    backgroundColor: palette.brandSoft,
    borderColor: '#B8E3D5',
  },
  row: {
    alignItems: 'center',
    borderBottomColor: palette.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.72,
  },
  iconBubble: {
    alignItems: 'center',
    backgroundColor: palette.brandSoft,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  rowDetail: {
    color: palette.muted,
    fontSize: 12,
    letterSpacing: 0,
  },
  rowValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: palette.brand,
  },
  secondaryButton: {
    backgroundColor: palette.brandSoft,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderColor: palette.line,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dangerButton: {
    backgroundColor: palette.coral,
  },
  disabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: palette.brand,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  primaryButtonText: {
    color: '#fff',
  },
  field: {
    gap: 7,
  },
  label: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: palette.line,
    borderRadius: 8,
    borderWidth: 1,
    color: palette.ink,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2F5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  successPill: {
    backgroundColor: palette.brandSoft,
  },
  warningPill: {
    backgroundColor: '#FFF1D7',
  },
  pillText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyDetail: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
