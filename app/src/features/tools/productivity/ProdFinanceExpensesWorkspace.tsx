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
import {
  calculateExpenseSplit,
  summarizePersonalExpenses,
  calculateMonthlyBudget,
  SplitExpenseItem,
  ExpenseRecord,
  BudgetCategory,
} from './shared/ProductivityHelpers';

interface ProdFinanceExpensesWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const ProdFinanceExpensesWorkspace: React.FC<ProdFinanceExpensesWorkspaceProps> = ({
  initialToolId = 421,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_finance_expenses;
  const workspaceTools = getProductivityWorkspaceTools('prod_finance_expenses');

  // Expense Splitter state
  const [splitExpenses, setSplitExpenses] = useState<SplitExpenseItem[]>([]);
  const [newPayer, setNewPayer] = useState('');
  const [newSplitAmount, setNewSplitAmount] = useState('');
  const [newParticipants, setNewParticipants] = useState('');

  // Personal Expense Tracker state
  const [personalExpenses, setPersonalExpenses] = useState<ExpenseRecord[]>([]);
  const [newExpCategory, setNewExpCategory] = useState('Dining');
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');

  // Budget Planner state
  const [monthlyIncome, setMonthlyIncome] = useState('0');
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('');
  const [newCatSpent, setNewCatSpent] = useState('');

  // Splitter engine
  const splitResult = calculateExpenseSplit(splitExpenses);

  const addSplitExpense = () => {
    const amt = parseFloat(newSplitAmount);
    if (!newPayer.trim() || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Entry', 'Please enter a valid payer name and positive amount.');
      return;
    }
    const parts = newParticipants
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      Alert.alert('Missing Participants', 'Please specify at least one participant.');
      return;
    }

    setSplitExpenses([
      ...splitExpenses,
      { payer: newPayer.trim(), amount: amt, participants: parts },
    ]);
    setNewPayer('');
    setNewSplitAmount('');
  };

  const deleteSplitExpense = (idx: number) => {
    setSplitExpenses(splitExpenses.filter((_, i) => i !== idx));
  };

  const clearAllSplitExpenses = () => {
    setSplitExpenses([]);
  };

  // Personal expense engine
  const expSummary = summarizePersonalExpenses(personalExpenses);

  const addPersonalExpense = () => {
    const amt = parseFloat(newExpAmount);
    if (!newExpDesc.trim() || isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid Entry', 'Please provide a valid description and amount.');
      return;
    }

    setPersonalExpenses([
      {
        category: newExpCategory,
        description: newExpDesc.trim(),
        amount: amt,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      },
      ...personalExpenses,
    ]);
    setNewExpDesc('');
    setNewExpAmount('');
  };

  const deletePersonalExpense = (idx: number) => {
    setPersonalExpenses(personalExpenses.filter((_, i) => i !== idx));
  };

  const clearAllPersonalExpenses = () => {
    setPersonalExpenses([]);
  };

  // Budget planner engine
  const incomeNum = parseFloat(monthlyIncome) || 0;
  const budgetResult = calculateMonthlyBudget(incomeNum, budgetCategories);

  const addBudgetCategory = () => {
    const b = parseFloat(newCatBudget);
    const s = parseFloat(newCatSpent) || 0;
    if (!newCatName.trim() || isNaN(b) || b <= 0) {
      Alert.alert('Invalid Category', 'Please enter category name and valid budget limit.');
      return;
    }
    setBudgetCategories([
      ...budgetCategories,
      { name: newCatName.trim(), budget: b, spent: s },
    ]);
    setNewCatName('');
    setNewCatBudget('');
    setNewCatSpent('');
  };

  const deleteBudgetCategory = (idx: number) => {
    setBudgetCategories(budgetCategories.filter((_, i) => i !== idx));
  };

  const clearAllBudgetCategories = () => {
    setBudgetCategories([]);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Finance & Expenses'}
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

        {/* TOOL 421: Expense Splitter */}
        {activeToolId === 421 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Add Group Expense</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Payer Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newPayer}
                    onChangeText={setNewPayer}
                    placeholder="e.g. Alice"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Amount ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newSplitAmount}
                    onChangeText={setNewSplitAmount}
                    keyboardType="numeric"
                    placeholder="e.g. 75.00"
                  />
                </View>
              </View>

              <Text style={styles.label}>Split Amongst (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={newParticipants}
                onChangeText={setNewParticipants}
                placeholder="Alice, Bob, Charlie"
              />

              <PrimaryButton
                title="Add Bill"
                icon="Plus"
                onPress={addSplitExpense}
              />

              <View style={styles.loggedSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.subheading}>Logged Expenses ({splitExpenses.length})</Text>
                  {splitExpenses.length > 0 && (
                    <TouchableOpacity onPress={clearAllSplitExpenses} style={styles.clearAllBtn}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {splitExpenses.length === 0 ? (
                  <Text style={styles.emptyItemsText}>No group expenses logged yet. Add a bill above.</Text>
                ) : (
                  splitExpenses.map((e, idx) => (
                    <View key={idx} style={styles.logRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logPayer}>{e.payer} paid ${e.amount.toFixed(2)}</Text>
                        <Text style={styles.logParts}>Split: {e.participants.join(', ')}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteSplitExpense(idx)}
                        style={styles.deleteBtn}
                        accessibilityLabel="Delete bill"
                      >
                        <AppIcon name="Trash2" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>

            <ProductivityResultCard
              title="Settlement Plan"
              badge="Optimal Settlement"
              primaryValue={`Total Group Spend: $${splitResult.totalSpent.toFixed(2)}`}
              primarySubtext={`${splitResult.settlements.length} payment transfers required`}
              details={
                splitResult.settlements.length > 0
                  ? splitResult.settlements
                      .map((s) => `• ${s.from} pays ${s.to} $${s.amount.toFixed(2)}`)
                      .join('\n')
                  : 'All balances are settled even! No payments needed.'
              }
              metadata={Object.entries(splitResult.balances).map(([p, b]) => ({
                label: p,
                value: b >= 0 ? `+$${b.toFixed(2)}` : `-$${Math.abs(b).toFixed(2)}`,
              }))}
              copyContent={splitResult.settlements
                .map((s) => `${s.from} pays ${s.to} $${s.amount.toFixed(2)}`)
                .join('\n')}
            />
          </View>
        )}

        {/* TOOL 422: Personal Expense Tracker */}
        {activeToolId === 422 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Log Personal Expense</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={newExpDesc}
                    onChangeText={setNewExpDesc}
                    placeholder="e.g. Coffee & Pastry"
                  />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.label}>Cost ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newExpAmount}
                    onChangeText={setNewExpAmount}
                    keyboardType="numeric"
                    placeholder="12.50"
                  />
                </View>
              </View>

              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryRow}>
                {['Dining', 'Groceries', 'Transport', 'Utilities', 'Entertainment'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.catPill,
                      newExpCategory === c && styles.catPillActive,
                    ]}
                    onPress={() => setNewExpCategory(c)}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        newExpCategory === c && styles.catPillTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton
                title="Record Expense"
                icon="DollarSign"
                onPress={addPersonalExpense}
              />

              <View style={styles.loggedSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.subheading}>Logged Expenses ({personalExpenses.length})</Text>
                  {personalExpenses.length > 0 && (
                    <TouchableOpacity onPress={clearAllPersonalExpenses} style={styles.clearAllBtn}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {personalExpenses.length === 0 ? (
                  <Text style={styles.emptyItemsText}>No expenses logged yet. Record your first expense above.</Text>
                ) : (
                  personalExpenses.map((exp, idx) => (
                    <View key={idx} style={styles.logRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logPayer}>{exp.description}</Text>
                        <Text style={styles.logParts}>{exp.category} • {exp.date}</Text>
                      </View>
                      <Text style={styles.logAmount}>${exp.amount.toFixed(2)}</Text>
                      <TouchableOpacity
                        onPress={() => deletePersonalExpense(idx)}
                        style={styles.deleteBtn}
                        accessibilityLabel="Delete expense"
                      >
                        <AppIcon name="Trash2" size={16} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            </View>

            <ProductivityResultCard
              title="Personal Spending Breakdown"
              badge="Expense Analytics"
              primaryValue={`Total Spent: $${expSummary.total.toFixed(2)}`}
              primarySubtext={`Highest expense: ${expSummary.highest?.description || 'N/A'} ($${expSummary.highest?.amount.toFixed(2) || 0})`}
              details={expSummary.byCategory
                .map((c) => `• ${c.category}: $${c.amount.toFixed(2)} (${c.percentage}%)`)
                .join('\n')}
              metadata={expSummary.byCategory.slice(0, 4).map((c) => ({
                label: c.category,
                value: `$${c.amount.toFixed(2)} (${c.percentage}%)`,
              }))}
              copyContent={`Total: $${expSummary.total.toFixed(2)}\n` + expSummary.byCategory.map((c) => `${c.category}: $${c.amount.toFixed(2)}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 423: Budget Planner */}
        {activeToolId === 423 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Monthly Budget Allocation</Text>
              <Text style={styles.label}>Monthly Net Income ($)</Text>
              <TextInput
                style={styles.input}
                value={monthlyIncome}
                onChangeText={setMonthlyIncome}
                keyboardType="numeric"
                placeholder="3500"
              />

              <Text style={styles.subheading}>Add Budget Category</Text>
              <TextInput
                style={styles.input}
                value={newCatName}
                onChangeText={setNewCatName}
                placeholder="Category Name (e.g. Groceries)"
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Budget Limit ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newCatBudget}
                    onChangeText={setNewCatBudget}
                    keyboardType="numeric"
                    placeholder="400"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Spent ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={newCatSpent}
                    onChangeText={setNewCatSpent}
                    keyboardType="numeric"
                    placeholder="120"
                  />
                </View>
              </View>
              <PrimaryButton
                title="Add Category"
                icon="Plus"
                onPress={addBudgetCategory}
              />

              <View style={styles.loggedSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.subheading}>Allocated Categories ({budgetCategories.length})</Text>
                  {budgetCategories.length > 0 && (
                    <TouchableOpacity onPress={clearAllBudgetCategories} style={styles.clearAllBtn}>
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {budgetCategories.length === 0 ? (
                  <Text style={styles.emptyItemsText}>No budget categories configured yet.</Text>
                ) : (
                  budgetCategories.map((cat, idx) => {
                    const isOver = cat.spent > cat.budget;
                    const ratio = cat.budget > 0 ? Math.min(100, Math.round((cat.spent / cat.budget) * 100)) : 0;
                    return (
                      <View key={idx} style={styles.budgetRow}>
                        <View style={styles.budgetHeader}>
                          <Text style={styles.catName}>{cat.name}</Text>
                          <View style={styles.budgetRightHeader}>
                            <Text style={[styles.catAmt, isOver && styles.catAmtOver]}>
                              ${cat.spent} / ${cat.budget} ({ratio}%)
                            </Text>
                            <TouchableOpacity
                              onPress={() => deleteBudgetCategory(idx)}
                              style={styles.deleteBtnSmall}
                              accessibilityLabel="Delete category"
                            >
                              <AppIcon name="Trash2" size={14} color="#DC2626" />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View style={styles.budgetBarBg}>
                          <View
                            style={[
                              styles.budgetBarFill,
                              { width: `${ratio}%` },
                              isOver && styles.budgetBarFillOver,
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </View>

            <ProductivityResultCard
              title="Budget Health Summary"
              badge="Cashflow & Savings"
              primaryValue={`Remaining Unspent: $${budgetResult.remainingIncome.toFixed(2)}`}
              primarySubtext={`Savings Rate: ${budgetResult.savingsRate}% of income`}
              details={
                budgetResult.overBudgetCategories.length > 0
                  ? `⚠️ Over Budget Warnings:\n` +
                    budgetResult.overBudgetCategories
                      .map((c) => `• ${c} exceeded monthly limit!`)
                      .join('\n')
                  : '✅ All categories are within planned budget limits.'
              }
              metadata={[
                { label: 'Total Budgeted', value: `$${budgetResult.totalBudgeted.toFixed(2)}` },
                { label: 'Total Spent', value: `$${budgetResult.totalSpent.toFixed(2)}` },
                { label: 'Remaining Budget', value: `$${budgetResult.remainingBudget.toFixed(2)}` },
                { label: 'Savings Rate', value: `${budgetResult.savingsRate}%` },
              ]}
              copyContent={`Monthly Income: $${monthlyIncome}\nTotal Spent: $${budgetResult.totalSpent}\nSavings Rate: ${budgetResult.savingsRate}%`}
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
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9D174D',
    marginTop: Spacing.sm,
    marginBottom: 6,
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  loggedSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FCE7F3',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    gap: 8,
  },
  logPayer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  logParts: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  catPillActive: {
    backgroundColor: '#DB2777',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  budgetRow: {
    marginBottom: Spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  catAmt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  catAmtOver: {
    color: '#DC2626',
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: Radius.full,
  },
  budgetBarFillOver: {
    backgroundColor: '#DC2626',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clearAllBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#FEE2E2',
    borderRadius: Radius.sm,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  emptyItemsText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
    paddingVertical: 6,
  },
  deleteBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnSmall: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#831843',
    marginRight: 6,
  },
  budgetRightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
