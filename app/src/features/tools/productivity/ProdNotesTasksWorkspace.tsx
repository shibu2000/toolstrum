import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  PRODUCTIVITY_WORKSPACES,
  PRODUCTIVITY_TOOL_CONFIGS,
  getProductivityWorkspaceTools,
} from './productivityConfig';
import { ProductivityResultCard } from './shared/ProductivityResultCard';

interface ProdNotesTasksWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

interface TodoItem {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  done: boolean;
  dueDate: string;
}

interface HabitItem {
  id: string;
  name: string;
  streak: number;
  bestStreak: number;
  completedToday: boolean;
}

export const ProdNotesTasksWorkspace: React.FC<ProdNotesTasksWorkspaceProps> = ({
  initialToolId = 417,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_notes_tasks;
  const workspaceTools = getProductivityWorkspaceTools('prod_notes_tasks');

  // Notes state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTag, setNoteTag] = useState('Work');
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Checklist state
  const [checkItems, setCheckItems] = useState<ChecklistItem[]>([]);
  const [newCheckText, setNewCheckText] = useState('');

  // To-Do state
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Habit state
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [newHabitName, setNewHabitName] = useState('');

  // Note helpers
  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a note title.');
      return;
    }
    const summary = `${noteTitle} [${noteTag}] - ${wordCount} words`;
    setSavedNotes([summary, ...savedNotes]);
    Alert.alert('Note Saved', `Saved "${noteTitle}" to local offline memory.`);
  };

  // Checklist helpers
  const checkedCount = checkItems.filter((i) => i.checked).length;
  const checkProgress = checkItems.length > 0 ? Math.round((checkedCount / checkItems.length) * 100) : 0;

  const toggleCheck = (id: string) => {
    setCheckItems(
      checkItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const addCheckItem = () => {
    if (!newCheckText.trim()) return;
    setCheckItems([
      ...checkItems,
      { id: Date.now().toString(), text: newCheckText.trim(), checked: false },
    ]);
    setNewCheckText('');
  };

  const loadChecklistTemplate = (type: 'trip' | 'deploy') => {
    if (type === 'trip') {
      setCheckItems([
        { id: 'c1', text: 'Passport & Identification', checked: false },
        { id: 'c2', text: 'Chargers and Power Bank', checked: false },
        { id: 'c3', text: 'Weather-appropriate clothing', checked: false },
        { id: 'c4', text: 'Hotel & Flight reservations saved offline', checked: false },
      ]);
    } else {
      setCheckItems([
        { id: 'd1', text: 'Run typescript compiler (0 errors)', checked: true },
        { id: 'd2', text: 'Execute all Jest unit test suites', checked: true },
        { id: 'd3', text: 'Inspect simulator rendering on iPhone', checked: true },
        { id: 'd4', text: 'Tag production git commit release', checked: false },
      ]);
    }
  };

  // To-Do helpers
  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTodo = () => {
    if (!newTodoTitle.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        title: newTodoTitle.trim(),
        priority: newTodoPriority,
        done: false,
        dueDate: 'Upcoming',
      },
    ]);
    setNewTodoTitle('');
  };

  // Habit helpers
  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;
        const nextState = !h.completedToday;
        const nextStreak = nextState ? h.streak + 1 : Math.max(0, h.streak - 1);
        return {
          ...h,
          completedToday: nextState,
          streak: nextStreak,
          bestStreak: Math.max(h.bestStreak, nextStreak),
        };
      })
    );
  };

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    setHabits([
      ...habits,
      {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        streak: 1,
        bestStreak: 1,
        completedToday: true,
      },
    ]);
    setNewHabitName('');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Notes & Tasks'}
        subtitle={`${workspaceMeta.title} • Offline Local`}
        showBack
        onBackPress={onBack}
      />

      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorBar}
        >
          {workspaceTools.map((tool) => {
            const cfg = PRODUCTIVITY_TOOL_CONFIGS[tool.id];
            const isSelected = tool.id === activeToolId;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolPill,
                  isSelected && styles.toolPillActive,
                ]}
                onPress={() => setActiveToolId(tool.id)}
              >
                <Text
                  style={[
                    styles.toolPillText,
                    isSelected && styles.toolPillTextActive,
                  ]}
                >
                  {cfg?.badge || tool.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield studioName="Productivity" />

        {/* TOOL 417: Notes App */}
        {activeToolId === 417 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Create / Edit Note</Text>
              <Text style={styles.label}>Note Title</Text>
              <TextInput
                style={styles.input}
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="e.g. Weekly Meeting Takeaways"
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Category Tag</Text>
                  <TextInput
                    style={styles.input}
                    value={noteTag}
                    onChangeText={setNoteTag}
                    placeholder="Work, Personal, Ideas"
                  />
                </View>
              </View>

              <Text style={styles.label}>Note Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={noteContent}
                onChangeText={setNoteContent}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholder="Write your markdown or plain text notes..."
              />

              <View style={styles.statsRow}>
                <Text style={styles.statChip}>{wordCount} Words</Text>
                <Text style={styles.statChip}>{charCount} Characters</Text>
                <Text style={styles.statChip}>{noteTag}</Text>
              </View>

              <PrimaryButton
                title="Save Offline Note"
                icon="Save"
                onPress={handleSaveNote}
              />
            </View>

            <ProductivityResultCard
              title={noteTitle || 'Untitled Note'}
              badge="Local Offline Note"
              subtitle={`Category: ${noteTag} • Auto-counted metrics`}
              primaryValue={`${wordCount} Words • ${charCount} Chars`}
              details={noteContent}
              metadata={[
                { label: 'Category', value: noteTag },
                { label: 'Saved Notes', value: `${savedNotes.length} in Memory` },
              ]}
              copyContent={noteContent}
            />
          </View>
        )}

        {/* TOOL 418: Checklist Maker */}
        {activeToolId === 418 && (
          <View>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Interactive Checklist</Text>
                <Text style={styles.progressPercent}>{checkProgress}% Done</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${checkProgress}%` }]} />
              </View>

              <View style={styles.templateRow}>
                <TouchableOpacity
                  style={styles.templateBtn}
                  onPress={() => loadChecklistTemplate('deploy')}
                >
                  <Text style={styles.templateBtnText}>Load Dev Release</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.templateBtn}
                  onPress={() => loadChecklistTemplate('trip')}
                >
                  <Text style={styles.templateBtnText}>Load Travel Pack</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemsList}>
                {checkItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checkItemRow}
                    onPress={() => toggleCheck(item.id)}
                  >
                    <View
                      style={[
                        styles.checkBox,
                        item.checked && styles.checkBoxChecked,
                      ]}
                    >
                      {item.checked && (
                        <AppIcon name="Check" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checkItemText,
                        item.checked && styles.checkItemTextDone,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.addItemRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newCheckText}
                  onChangeText={setNewCheckText}
                  placeholder="Add item..."
                />
                <TouchableOpacity style={styles.addBtn} onPress={addCheckItem}>
                  <AppIcon name="Plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            <ProductivityResultCard
              title="Checklist Status"
              badge="Structured Checklist"
              primaryValue={`${checkedCount} of ${checkItems.length} Completed`}
              primarySubtext={`${checkProgress}% overall progress`}
              details={checkItems
                .map((i) => `[${i.checked ? 'X' : ' '}] ${i.text}`)
                .join('\n')}
              metadata={[
                { label: 'Completed', value: `${checkedCount}` },
                { label: 'Remaining', value: `${checkItems.length - checkedCount}` },
              ]}
              copyContent={checkItems
                .map((i) => `[${i.checked ? 'X' : ' '}] ${i.text}`)
                .join('\n')}
            />
          </View>
        )}

        {/* TOOL 419: To-Do List */}
        {activeToolId === 419 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Task & Priority Manager</Text>
              <View style={styles.todoInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newTodoTitle}
                  onChangeText={setNewTodoTitle}
                  placeholder="New task description..."
                />
                <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
                  <AppIcon name="Plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.prioritySelectorRow}>
                {(['High', 'Medium', 'Low'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityPill,
                      newTodoPriority === p && styles.priorityPillActive,
                    ]}
                    onPress={() => setNewTodoPriority(p)}
                  >
                    <Text
                      style={[
                        styles.priorityPillText,
                        newTodoPriority === p && styles.priorityPillTextActive,
                      ]}
                    >
                      {p} Priority
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.itemsList}>
                {todos.map((todo) => (
                  <TouchableOpacity
                    key={todo.id}
                    style={styles.todoItemRow}
                    onPress={() => toggleTodo(todo.id)}
                  >
                    <View
                      style={[
                        styles.checkBox,
                        todo.done && styles.checkBoxChecked,
                      ]}
                    >
                      {todo.done && (
                        <AppIcon name="Check" size={12} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.todoTitle,
                          todo.done && styles.checkItemTextDone,
                        ]}
                      >
                        {todo.title}
                      </Text>
                      <Text style={styles.todoMeta}>
                        Due: {todo.dueDate} • Priority: {todo.priority}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.priorityTag,
                        todo.priority === 'High' && styles.priorityHigh,
                        todo.priority === 'Medium' && styles.priorityMed,
                      ]}
                    >
                      <Text style={styles.priorityTagText}>{todo.priority}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ProductivityResultCard
              title="To-Do Roster"
              badge="Priority Task Tracker"
              primaryValue={`${todos.filter((t) => !t.done).length} Open Tasks`}
              primarySubtext={`${todos.filter((t) => t.done).length} marked completed`}
              details={todos
                .map((t) => `• [${t.priority}] ${t.title} - ${t.done ? 'DONE' : 'PENDING'}`)
                .join('\n')}
              metadata={[
                { label: 'High Priority', value: `${todos.filter((t) => t.priority === 'High' && !t.done).length}` },
                { label: 'Total Tasks', value: `${todos.length}` },
              ]}
              copyContent={todos.map((t) => `• ${t.title} (${t.priority})`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 420: Habit Tracker */}
        {activeToolId === 420 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Daily Habit Streaks</Text>
              <View style={styles.todoInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={newHabitName}
                  onChangeText={setNewHabitName}
                  placeholder="New habit to form..."
                />
                <TouchableOpacity style={styles.addBtn} onPress={addHabit}>
                  <AppIcon name="Plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.itemsList}>
                {habits.map((habit) => (
                  <View key={habit.id} style={styles.habitRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.habitName}>{habit.name}</Text>
                      <Text style={styles.habitStreak}>
                        🔥 {habit.streak} Day Streak (Best: {habit.bestStreak})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.habitToggleBtn,
                        habit.completedToday && styles.habitToggleBtnDone,
                      ]}
                      onPress={() => toggleHabit(habit.id)}
                    >
                      <AppIcon
                        name={habit.completedToday ? 'Check' : 'Circle'}
                        size={16}
                        color={habit.completedToday ? '#FFFFFF' : '#BE185D'}
                      />
                      <Text
                        style={[
                          styles.habitToggleText,
                          habit.completedToday && styles.habitToggleTextDone,
                        ]}
                      >
                        {habit.completedToday ? 'Done Today' : 'Mark Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <ProductivityResultCard
              title="Habit Consistency Overview"
              badge="Streak Analytics"
              primaryValue={`${habits.filter((h) => h.completedToday).length} of ${habits.length} Habits Completed Today`}
              primarySubtext={`Longest active streak: ${Math.max(...habits.map((h) => h.streak), 0)} days`}
              details={habits
                .map((h) => `• ${h.name}: ${h.streak} days (${h.completedToday ? 'Done Today' : 'Pending'})`)
                .join('\n')}
              metadata={[
                { label: 'Active Habits', value: `${habits.length}` },
                { label: 'Completed Today', value: `${habits.filter((h) => h.completedToday).length}` },
              ]}
              copyContent={habits.map((h) => `${h.name}: ${h.streak} days`).join('\n')}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectorWrapper: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FBCFE8',
    justifyContent: 'center',
  },
  selectorScroll: {
    height: 52,
    flexGrow: 0,
  },
  selectorBar: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#BE185D',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9D174D',
  },
  toolPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#831843',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  statChip: {
    fontSize: 11,
    fontWeight: '700',
    color: '#BE185D',
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DB2777',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FCE7F3',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#DB2777',
    borderRadius: Radius.full,
  },
  templateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  templateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  templateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9D174D',
  },
  itemsList: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DB2777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#DB2777',
  },
  checkItemText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  checkItemTextDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#DB2777',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  prioritySelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  priorityPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  priorityPillActive: {
    backgroundColor: '#DB2777',
  },
  priorityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  priorityPillTextActive: {
    color: '#FFFFFF',
  },
  todoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  todoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  todoMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: '#F1F5F9',
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityMed: {
    backgroundColor: '#FEF3C7',
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  habitName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  habitStreak: {
    fontSize: 12,
    color: '#BE185D',
    fontWeight: '600',
    marginTop: 2,
  },
  habitToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#DB2777',
  },
  habitToggleBtnDone: {
    backgroundColor: '#DB2777',
    borderColor: '#BE185D',
  },
  habitToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
  },
  habitToggleTextDone: {
    color: '#FFFFFF',
  },
});
