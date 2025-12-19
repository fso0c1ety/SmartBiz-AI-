import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '../constants/spacing';
import { useThemeStore } from '../store/useThemeStore';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onPress?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onPress }) => {
  const { colorScheme } = useThemeStore();
  const colors = Colors[colorScheme];

  const priorityColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
  };

  return (
    <TouchableOpacity onPress={() => onPress?.(task)} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => onToggle(task.id)}
            style={[
              styles.checkbox,
              {
                borderColor: task.completed ? colors.primary : colors.border,
                backgroundColor: task.completed ? colors.primary : 'transparent',
              },
            ]}
          >
            {task.completed && (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <View style={styles.info}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                task.completed && styles.completed,
              ]}
            >
              {task.title}
            </Text>
            {task.description && (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {task.description}
              </Text>
            )}
            {task.dueDate && (
              <View style={styles.footer}>
                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
                  {task.dueDate.toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.priorityDot,
              { backgroundColor: priorityColors[task.priority] },
            ]}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  completed: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dueDate: {
    fontSize: FontSize.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
});
