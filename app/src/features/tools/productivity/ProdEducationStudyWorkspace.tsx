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
  lookupDictionaryWord,
  analyzeReadingMetrics,
  generateStudyQuiz,
  QuizQuestion,
} from './shared/ProductivityHelpers';

interface ProdEducationStudyWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

interface TimetableSlot {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export const ProdEducationStudyWorkspace: React.FC<ProdEducationStudyWorkspaceProps> = ({
  initialToolId = 430,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_education_study;
  const workspaceTools = getProductivityWorkspaceTools('prod_education_study');

  // Timetable state
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [newSubj, setNewSubj] = useState('');
  const [newTime, setNewTime] = useState('09:00 - 10:30');
  const [newRoom, setNewRoom] = useState('');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Quiz state
  const [quizTopic, setQuizTopic] = useState('Computer Science');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => generateStudyQuiz('Computer Science'));
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Lexicon / Dictionary / Synonyms / Pronunciation state
  const [lexiconWord, setLexiconWord] = useState('');

  // Text Reader state
  const [readerText, setReaderText] = useState('');

  // Timetable helpers
  const daySchedule = timetable.filter((t) => t.day === selectedDay);
  const addSlot = () => {
    if (!newSubj.trim()) return;
    setTimetable([
      ...timetable,
      {
        id: Date.now().toString(),
        day: selectedDay,
        time: newTime,
        subject: newSubj.trim(),
        room: newRoom.trim(),
      },
    ]);
    setNewSubj('');
  };

  // Flashcard helpers
  const currentCard = flashcards[currentCardIdx] || flashcards[0];
  const toggleMastery = () => {
    setFlashcards(
      flashcards.map((c, i) =>
        i === currentCardIdx ? { ...c, mastered: !c.mastered } : c
      )
    );
  };

  // Quiz helpers
  const handleAnswerSelect = (qIdx: number, oIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers({ ...userAnswers, [qIdx]: oIdx });
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) correct++;
    });
    return correct;
  };

  // Lexical lookup
  const dictEntry = lookupDictionaryWord(lexiconWord);

  // Text metrics
  const readMetrics = analyzeReadingMetrics(readerText);

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Education & Study'}
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

        {/* TOOL 430: Timetable Maker */}
        {activeToolId === 430 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Weekly Class Timetable</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayBar}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayPill, selectedDay === d && styles.dayPillActive]}
                    onPress={() => setSelectedDay(d)}
                  >
                    <Text style={[styles.dayPillText, selectedDay === d && styles.dayPillTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.scheduleList}>
                {daySchedule.length > 0 ? (
                  daySchedule.map((slot) => (
                    <View key={slot.id} style={styles.slotRow}>
                      <View style={styles.timeBadge}>
                        <Text style={styles.timeText}>{slot.time}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.slotSubj}>{slot.subject}</Text>
                        <Text style={styles.slotRoom}>{slot.room}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>No classes scheduled for {selectedDay}.</Text>
                )}
              </View>

              <Text style={styles.subheading}>Add Class to {selectedDay}</Text>
              <TextInput
                style={styles.input}
                value={newSubj}
                onChangeText={setNewSubj}
                placeholder="Subject Name (e.g. Modern Physics)"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="09:00 - 10:30"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newRoom}
                  onChangeText={setNewRoom}
                  placeholder="Room 102"
                />
              </View>
              <PrimaryButton title="Add to Timetable" icon="Plus" onPress={addSlot} />
            </View>

            <ProductivityResultCard
              title={`${selectedDay} Timetable`}
              badge="Class Schedule"
              primaryValue={`${daySchedule.length} Sessions Scheduled`}
              primarySubtext={`Total across week: ${timetable.length} classes`}
              details={daySchedule
                .map((s) => `• ${s.time}: ${s.subject} (${s.room})`)
                .join('\n')}
              metadata={[
                { label: 'Day', value: selectedDay },
                { label: 'Classes', value: `${daySchedule.length}` },
              ]}
              copyContent={daySchedule.map((s) => `${s.time}: ${s.subject} (${s.room})`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 431: Flashcard Maker */}
        {activeToolId === 431 && (
          <View>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Flashcard Study Deck</Text>
                <Text style={styles.cardCounter}>
                  Card {currentCardIdx + 1} of {flashcards.length}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.flashcardContainer}
                activeOpacity={0.8}
                onPress={() => setCardFlipped(!cardFlipped)}
              >
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>
                    {cardFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}
                  </Text>
                </View>
                <Text style={styles.flashcardText}>
                  {cardFlipped ? currentCard.back : currentCard.front}
                </Text>
                <Text style={styles.flipHint}>Tap card to flip</Text>
              </TouchableOpacity>

              <View style={styles.flashcardNav}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => {
                    setCardFlipped(false);
                    setCurrentCardIdx(Math.max(0, currentCardIdx - 1));
                  }}
                  disabled={currentCardIdx === 0}
                >
                  <AppIcon name="ArrowLeft" size={16} color="#DB2777" />
                  <Text style={styles.navBtnText}>Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.navBtn, currentCard.mastered && styles.navBtnMastered]}
                  onPress={toggleMastery}
                >
                  <AppIcon
                    name={currentCard.mastered ? 'CheckCircle' : 'Circle'}
                    size={16}
                    color={currentCard.mastered ? '#059669' : '#DB2777'}
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      currentCard.mastered && { color: '#059669' },
                    ]}
                  >
                    {currentCard.mastered ? 'Mastered' : 'Mark Learned'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => {
                    setCardFlipped(false);
                    setCurrentCardIdx(
                      Math.min(flashcards.length - 1, currentCardIdx + 1)
                    );
                  }}
                  disabled={currentCardIdx === flashcards.length - 1}
                >
                  <Text style={styles.navBtnText}>Next</Text>
                  <AppIcon name="ArrowRight" size={16} color="#DB2777" />
                </TouchableOpacity>
              </View>
            </View>

            <ProductivityResultCard
              title="Study Deck Progress"
              badge="Spaced Flashcards"
              primaryValue={`${flashcards.filter((f) => f.mastered).length} of ${flashcards.length} Mastered`}
              primarySubtext={`Current card: "${currentCard.front}"`}
              details={`Front: ${currentCard.front}\nBack: ${currentCard.back}`}
              metadata={[
                { label: 'Mastered', value: `${flashcards.filter((f) => f.mastered).length}` },
                { label: 'Deck Size', value: `${flashcards.length}` },
              ]}
              copyContent={`Q: ${currentCard.front}\nA: ${currentCard.back}`}
            />
          </View>
        )}

        {/* TOOL 432: Quiz Generator */}
        {activeToolId === 432 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Interactive Knowledge Quiz</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={quizTopic}
                  onChangeText={setQuizTopic}
                  placeholder="Topic (e.g. History, Science)"
                />
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => {
                    setQuizQuestions(generateStudyQuiz(quizTopic));
                    setUserAnswers({});
                    setQuizSubmitted(false);
                  }}
                >
                  <AppIcon name="RefreshCw" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: Spacing.md }}>
                {quizQuestions.map((q, qIdx) => (
                  <View key={qIdx} style={styles.quizQBox}>
                    <Text style={styles.qText}>
                      {qIdx + 1}. {q.question}
                    </Text>
                    {q.options.map((opt, oIdx) => {
                      const selected = userAnswers[qIdx] === oIdx;
                      const isCorrect = q.correctIndex === oIdx;
                      return (
                        <TouchableOpacity
                          key={oIdx}
                          style={[
                            styles.optionPill,
                            selected && styles.optionPillSelected,
                            quizSubmitted && isCorrect && styles.optionCorrect,
                            quizSubmitted && selected && !isCorrect && styles.optionIncorrect,
                          ]}
                          onPress={() => handleAnswerSelect(qIdx, oIdx)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected && styles.optionTextSelected,
                            ]}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              {!quizSubmitted ? (
                <PrimaryButton
                  title="Submit & Evaluate Quiz"
                  icon="Check"
                  onPress={() => setQuizSubmitted(true)}
                />
              ) : (
                <View style={styles.scoreBanner}>
                  <Text style={styles.scoreText}>
                    Final Score: {calculateScore()} / {quizQuestions.length}
                  </Text>
                </View>
              )}
            </View>

            <ProductivityResultCard
              title={`Quiz on ${quizTopic}`}
              badge="Knowledge Evaluation"
              primaryValue={
                quizSubmitted
                  ? `${calculateScore()} / ${quizQuestions.length} Correct`
                  : 'Quiz in Progress'
              }
              primarySubtext={`${quizQuestions.length} multiple choice questions`}
              details={quizQuestions
                .map((q, i) => `${i + 1}. ${q.question}\nCorrect Answer: ${q.options[q.correctIndex]}`)
                .join('\n\n')}
              metadata={[
                { label: 'Topic', value: quizTopic },
                { label: 'Questions', value: `${quizQuestions.length}` },
              ]}
              copyContent={quizQuestions.map((q) => q.question).join('\n')}
            />
          </View>
        )}

        {/* TOOL 433: Unit Conversion Reference */}
        {activeToolId === 433 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Unit Conversion Reference</Text>
              <Text style={styles.subheading}>Length & Distance</Text>
              <Text style={styles.refRow}>• 1 inch = 2.54 cm</Text>
              <Text style={styles.refRow}>• 1 foot = 0.3048 m = 12 inches</Text>
              <Text style={styles.refRow}>• 1 mile = 1.60934 km = 5,280 feet</Text>

              <Text style={styles.subheading}>Mass & Weight</Text>
              <Text style={styles.refRow}>• 1 kg = 2.20462 lbs = 1000 g</Text>
              <Text style={styles.refRow}>• 1 pound (lb) = 453.592 g = 16 oz</Text>

              <Text style={styles.subheading}>Volume & Liquid</Text>
              <Text style={styles.refRow}>• 1 liter = 1000 mL = 0.264172 US Gallons</Text>
              <Text style={styles.refRow}>• 1 US Gallon = 3.78541 liters = 128 fl oz</Text>

              <Text style={styles.subheading}>Digital Storage</Text>
              <Text style={styles.refRow}>• 1 Kilobyte (KB) = 1,024 Bytes</Text>
              <Text style={styles.refRow}>• 1 Megabyte (MB) = 1,024 KB = 1,048,576 Bytes</Text>
              <Text style={styles.refRow}>• 1 Gigabyte (GB) = 1,024 MB</Text>
            </View>

            <ProductivityResultCard
              title="Unit Conversion Cheatsheet"
              badge="Standard Factors"
              primaryValue="SI Metric & Imperial Equivalents"
              details="1 in = 2.54 cm | 1 kg = 2.2046 lb | 1 gal = 3.785 L | 1 MB = 1024 KB"
              metadata={[
                { label: 'Categories', value: 'Length, Mass, Volume, Data' },
                { label: 'Standard', value: 'NIST & SI System' },
              ]}
              copyContent="1 in = 2.54 cm\n1 ft = 0.3048 m\n1 mi = 1.609 km\n1 kg = 2.204 lb\n1 gal = 3.785 L"
            />
          </View>
        )}

        {/* TOOL 434: Dictionary, 435: Synonyms, 436: Antonyms, 437: Pronunciation */}
        {(activeToolId === 434 || activeToolId === 435 || activeToolId === 436 || activeToolId === 437) && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {activeToolId === 434
                  ? 'Offline English Lexicon'
                  : activeToolId === 435
                  ? 'Synonym & Thesaurus Finder'
                  : activeToolId === 436
                  ? 'Antonym Finder'
                  : 'Word Phonetic Pronunciation'}
              </Text>
              <Text style={styles.label}>Search Word</Text>
              <TextInput
                style={styles.input}
                value={lexiconWord}
                onChangeText={setLexiconWord}
                placeholder="e.g. serendipity, ephemeral, pragmatic"
              />

              <View style={styles.wordDetailBox}>
                <Text style={styles.dictHead}>{dictEntry.word}</Text>
                <Text style={styles.dictPhonetic}>{dictEntry.phonetic} • {dictEntry.partOfSpeech}</Text>
                <Text style={styles.dictDef}>{dictEntry.definition}</Text>
                <Text style={styles.dictExample}>"{dictEntry.example}"</Text>
              </View>
            </View>

            <ProductivityResultCard
              title={dictEntry.word.toUpperCase()}
              badge="Lexical Reference"
              primaryValue={dictEntry.phonetic}
              primarySubtext={`Part of Speech: ${dictEntry.partOfSpeech}`}
              details={
                activeToolId === 435
                  ? `Synonyms:\n${dictEntry.synonyms.map((s) => `• ${s}`).join('\n')}`
                  : activeToolId === 436
                  ? `Antonyms:\n${dictEntry.antonyms.map((a) => `• ${a}`).join('\n')}`
                  : activeToolId === 437
                  ? `Phonetic Breakdown: ${dictEntry.phonetic}\nStress: Primary on syllable\nDefinition: ${dictEntry.definition}`
                  : `Definition: ${dictEntry.definition}\nExample: "${dictEntry.example}"`
              }
              metadata={[
                { label: 'Word', value: dictEntry.word },
                { label: 'Synonyms', value: `${dictEntry.synonyms.length} Found` },
                { label: 'Antonyms', value: `${dictEntry.antonyms.length} Found` },
              ]}
              copyContent={`${dictEntry.word} (${dictEntry.phonetic}): ${dictEntry.definition}`}
            />
          </View>
        )}

        {/* TOOL 438: Text Reader */}
        {activeToolId === 438 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Reading Speed & Metrics Analyzer</Text>
              <Text style={styles.label}>Paste Text to Analyze</Text>
              <TextInput
                style={[styles.input, { minHeight: 90 }]}
                value={readerText}
                onChangeText={setReaderText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <ProductivityResultCard
              title="Reading Diagnostics"
              badge="Text Metrics"
              primaryValue={`${readMetrics.readingMinutes}m ${readMetrics.readingSeconds}s Estimated Read Time`}
              primarySubtext={`At standard 200 Words Per Minute`}
              details={`Word Count: ${readMetrics.wordCount}\nCharacter Count: ${readMetrics.charCount}\nSyllables: ${readMetrics.syllableCount}\nSpeech Time: ~${readMetrics.speakingMinutes} mins (130 WPM)\nReadability Ease: ${readMetrics.readabilityScore}/100`}
              metadata={[
                { label: 'Word Count', value: `${readMetrics.wordCount}` },
                { label: 'Chars', value: `${readMetrics.charCount}` },
                { label: 'Speech Time', value: `~${readMetrics.speakingMinutes} min` },
                { label: 'Readability', value: `${readMetrics.readabilityScore} / 100` },
              ]}
              copyContent={`Words: ${readMetrics.wordCount}, Read Time: ${readMetrics.readingMinutes}m ${readMetrics.readingSeconds}s`}
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
  dayBar: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  dayPillActive: {
    backgroundColor: '#DB2777',
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scheduleList: {
    gap: 6,
    marginVertical: Spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  timeBadge: {
    backgroundColor: '#DB2777',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  slotSubj: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  slotRoom: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
  },
  flashcardContainer: {
    backgroundColor: '#FDF2F8',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBCFE8',
    marginBottom: Spacing.md,
  },
  cardBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FCE7F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#BE185D',
  },
  flashcardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#831843',
    textAlign: 'center',
    marginVertical: 12,
  },
  flipHint: {
    fontSize: 11,
    color: '#9D174D',
    fontStyle: 'italic',
  },
  flashcardNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  navBtnMastered: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#DB2777',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizQBox: {
    marginBottom: Spacing.md,
    backgroundColor: '#FDF2F8',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  qText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  optionPill: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: Radius.sm,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionPillSelected: {
    borderColor: '#DB2777',
    backgroundColor: '#FDF2F8',
  },
  optionCorrect: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  optionIncorrect: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  optionText: {
    fontSize: 13,
    color: '#334155',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#9D174D',
  },
  scoreBanner: {
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
  },
  refRow: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  wordDetailBox: {
    backgroundColor: '#FDF2F8',
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  dictHead: {
    fontSize: 18,
    fontWeight: '800',
    color: '#831843',
    textTransform: 'capitalize',
  },
  dictPhonetic: {
    fontSize: 12,
    color: '#9D174D',
    fontWeight: '600',
    marginBottom: 6,
  },
  dictDef: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 6,
  },
  dictExample: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
  },
});
