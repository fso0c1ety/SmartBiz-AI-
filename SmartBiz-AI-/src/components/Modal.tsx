import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const ModalComponent: React.FC<ModalComponentProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.card,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                      <Ionicons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              <View style={styles.body}>{children}</View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.xl,
    width: '100%',
    maxWidth: 500,
    maxHeight: Dimensions.get('window').height * 0.8,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    flex: 1,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  body: {
    flex: 1,
  },
});
