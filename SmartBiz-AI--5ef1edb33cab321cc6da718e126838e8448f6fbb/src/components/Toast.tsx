import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';
import { useToastStore, ToastType } from '../store/useToastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToastStore();
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  const getToastColor = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const getToastIcon = (type: ToastType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      default:
        return 'information-circle';
    }
  };

  return (
    <View style={styles.container}>
      {toasts.map((toast) => (
        <View
          key={toast.id}
          style={[
            styles.toast,
            { backgroundColor: colors.card, borderLeftColor: getToastColor(toast.type) },
          ]}
        >
          <Ionicons
            name={getToastIcon(toast.type)}
            size={24}
            color={getToastColor(toast.type)}
          />
          <Text style={[styles.message, { color: colors.text }]}>{toast.message}</Text>
          <TouchableOpacity onPress={() => hideToast(toast.id)}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
});
