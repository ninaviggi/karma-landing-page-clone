import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { theme } from '@/constants/theme';
import { useAudioStore } from '@/stores/audioStore';

const TYPE_LABEL: Record<string, string> = {
  word: 'Words',
  sentence: 'Sentences',
  step: 'Steps',
  wonder: 'Wonder',
};

interface Props {
  onClose: () => void;
}

export const AudioModeView = ({ onClose }: Props) => {
  useKeepAwake();
  const status = useAudioStore((s) => s.status);
  const frames = useAudioStore((s) => s.frames);
  const position = useAudioStore((s) => s.position);
  const cache = useAudioStore((s) => s.cacheProgress);
  const error = useAudioStore((s) => s.error);
  const play = useAudioStore((s) => s.play);
  const pause = useAudioStore((s) => s.pause);
  const next = useAudioStore((s) => s.next);
  const previous = useAudioStore((s) => s.previous);

  const current = frames[position];

  useEffect(() => {
    if (status === 'completed') Vibration.vibrate(20);
  }, [status]);

  if (status === 'preparing') {
    const pct = cache && cache.total > 0 ? Math.round((cache.done / cache.total) * 100) : 0;
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.accent} />
        <Text style={styles.preparingTitle}>Preparing audio</Text>
        <Text style={styles.preparingMeta}>
          {cache ? `${cache.done} of ${cache.total} · ${pct}%` : 'starting...'}
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Couldn't start audio mode</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Pressable onPress={onClose} style={styles.cta}>
          <Text style={styles.ctaText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'completed') {
    return (
      <View style={styles.center}>
        <Text style={styles.completedKicker}>FINISHED</Text>
        <Text style={styles.completedTitle}>That's the whole thing.</Text>
        <Pressable onPress={onClose} style={styles.cta}>
          <Text style={styles.ctaText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.center}>
        <Pressable onPress={play} style={styles.cta}>
          <Text style={styles.ctaText}>Start</Text>
        </Pressable>
      </View>
    );
  }

  const isPlaying = status === 'playing';

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Pressable onPress={onClose} hitSlop={12} style={styles.topClose}>
          <Text style={styles.topCloseText}>← Done</Text>
        </Pressable>
        <Text style={styles.typeLabel}>
          {TYPE_LABEL[current.type] ?? current.type}
        </Text>
      </View>

      <View style={styles.stage}>
        <Text style={styles.target} numberOfLines={3}>
          {current.targetText}
        </Text>
        <Text style={styles.base} numberOfLines={2}>
          {current.baseText}
        </Text>
        {current.phonetic ? (
          <Text style={styles.phonetic}>{current.phonetic}</Text>
        ) : null}
      </View>

      <View style={styles.dots}>
        {frames.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === position && styles.dotActive,
              i < position && styles.dotPast,
            ]}
          />
        ))}
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={previous}
          hitSlop={12}
          style={styles.controlBtn}
          accessibilityLabel="Previous"
        >
          <Text style={styles.controlIcon}>⏮</Text>
        </Pressable>
        <Pressable
          onPress={isPlaying ? pause : play}
          hitSlop={12}
          style={[styles.controlBtn, styles.controlBtnLg]}
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
        >
          <Text style={styles.controlIconLg}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>
        <Pressable
          onPress={next}
          hitSlop={12}
          style={styles.controlBtn}
          accessibilityLabel="Next"
        >
          <Text style={styles.controlIcon}>⏭</Text>
        </Pressable>
      </View>

      <Text style={styles.footer}>
        {position + 1} of {frames.length} · {TYPE_LABEL[current.type] ?? current.type}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topClose: {
    paddingVertical: theme.spacing.xs,
  },
  topCloseText: {
    color: theme.colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  typeLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  target: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    textAlign: 'center',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  base: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  phonetic: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textTertiary,
    fontFamily: theme.typography.mono.fontFamily,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceHover,
  },
  dotActive: {
    backgroundColor: theme.colors.accent,
    width: 24,
  },
  dotPast: {
    backgroundColor: theme.colors.textTertiary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  controlBtnLg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.accent,
  },
  controlIcon: {
    fontSize: 22,
    color: theme.colors.text,
  },
  controlIconLg: {
    fontSize: 26,
    color: theme.colors.white,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textTertiary,
    letterSpacing: 1,
  },
  preparingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  preparingMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorBody: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  cta: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    borderRadius: 999,
  },
  ctaText: {
    color: theme.colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  completedKicker: {
    fontSize: 11,
    letterSpacing: 2,
    color: theme.colors.textTertiary,
    fontWeight: '600',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
