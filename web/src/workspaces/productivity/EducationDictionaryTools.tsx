import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  Copy,
  Check,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  Scale,
  Compass,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// OFFLINE DICTIONARY & THESAURUS DATASET
// ========================================================
interface LexiconEntry {
  word: string;
  phonetic: string;
  pos: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}

const OFFLINE_LEXICON: Record<string, LexiconEntry> = {
  abundant: {
    word: 'abundant',
    phonetic: '/əˈbʌn.dənt/',
    pos: 'adjective',
    definition: 'Existing or available in large quantities; overflowing or plentiful.',
    example: 'The region is blessed with abundant natural resources and clean water.',
    synonyms: ['plentiful', 'copious', 'ample', 'bountiful', 'luxuriant', 'profuse'],
    antonyms: ['scarce', 'sparse', 'meager', 'insufficient', 'lacking'],
  },
  accurate: {
    word: 'accurate',
    phonetic: '/ˈæk.jə.rət/',
    pos: 'adjective',
    definition: 'Correct in all details; exact and free from error.',
    example: 'The GPS tracking provided an accurate measurement of the hiking trail.',
    synonyms: ['precise', 'exact', 'correct', 'flawless', 'meticulous', 'verifiable'],
    antonyms: ['inaccurate', 'erroneous', 'faulty', 'imprecise', 'flawed'],
  },
  adaptable: {
    word: 'adaptable',
    phonetic: '/əˈdæp.tə.bəl/',
    pos: 'adjective',
    definition: 'Able to adjust to new conditions or be modified for different uses.',
    example: 'Modern web applications must be adaptable across smartphones and desktops.',
    synonyms: ['flexible', 'versatile', 'resilient', 'malleable', 'pliant'],
    antonyms: ['rigid', 'inflexible', 'stubborn', 'unyielding'],
  },
  benevolent: {
    word: 'benevolent',
    phonetic: '/bəˈnev.əl.ənt/',
    pos: 'adjective',
    definition: 'Well meaning and kindly; serving a charitable rather than profit-making purpose.',
    example: 'The organization was founded by a benevolent patron to support education.',
    synonyms: ['kind', 'generous', 'magnanimous', 'compassionate', 'altruistic'],
    antonyms: ['malevolent', 'malicious', 'spiteful', 'cruel', 'hostile'],
  },
  candid: {
    word: 'candid',
    phonetic: '/ˈkæn.dɪd/',
    pos: 'adjective',
    definition: 'Truthful and straightforward; frank and unreserved in expression.',
    example: 'She gave a candid assessment of the project challenges during the review.',
    synonyms: ['frank', 'honest', 'forthright', 'genuine', 'sincere', 'direct'],
    antonyms: ['dishonest', 'deceitful', 'guarded', 'insincere', 'evasive'],
  },
  catalyst: {
    word: 'catalyst',
    phonetic: '/ˈkæt.əl.ɪst/',
    pos: 'noun',
    definition: 'A substance or event that precipitates a reaction or dramatic change without itself being consumed.',
    example: 'The new policy served as a catalyst for digital transformation across the team.',
    synonyms: ['spark', 'stimulus', 'impetus', 'accelerator', 'initiator'],
    antonyms: ['inhibitor', 'deterrent', 'hindrance', 'blocker'],
  },
  diligent: {
    word: 'diligent',
    phonetic: '/ˈdɪl.ɪ.dʒənt/',
    pos: 'adjective',
    definition: 'Having or showing care and conscientiousness in one\'s work or duties.',
    example: 'Diligent verification before deployment prevents critical production bugs.',
    synonyms: ['hardworking', 'meticulous', 'assiduous', 'conscientious', 'thorough'],
    antonyms: ['lazy', 'negligent', 'slothful', 'careless', 'heedless'],
  },
  eloquent: {
    word: 'eloquent',
    phonetic: '/ˈel.ə.kwənt/',
    pos: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing; clearly expressing feelings.',
    example: 'The keynote speaker delivered an eloquent summary of sustainable energy.',
    synonyms: ['articulate', 'expressive', 'persuasive', 'fluent', 'poignant'],
    antonyms: ['inarticulate', 'hesitant', 'unexpressive', 'muddled'],
  },
  ephemeral: {
    word: 'ephemeral',
    phonetic: '/ɪˈfem.ər.əl/',
    pos: 'adjective',
    definition: 'Lasting for a very short time; transitory and fleeting.',
    example: 'Social media trends are often ephemeral, vanishing within days.',
    synonyms: ['transient', 'fleeting', 'short-lived', 'momentary', 'fugitive'],
    antonyms: ['permanent', 'enduring', 'eternal', 'everlasting', 'perpetual'],
  },
  frugal: {
    word: 'frugal',
    phonetic: '/ˈfruː.ɡəl/',
    pos: 'adjective',
    definition: 'Sparing or economical with regard to money or food; simple and plain.',
    example: 'His frugal habits allowed him to build a substantial investment fund.',
    synonyms: ['economical', 'thrifty', 'sparing', 'prudent', 'moderate'],
    antonyms: ['wasteful', 'extravagant', 'prodigal', 'lavish', 'spendthrift'],
  },
  lucid: {
    word: 'lucid',
    phonetic: '/ˈluː.sɪd/',
    pos: 'adjective',
    definition: 'Expressed clearly; easy to understand; showing full cognitive clarity.',
    example: 'The tutorial provided a lucid explanation of complex cryptographic hashing.',
    synonyms: ['clear', 'coherent', 'comprehensible', 'intelligible', 'luminous'],
    antonyms: ['confusing', 'obscure', 'vague', 'murky', 'muddled'],
  },
  meticulous: {
    word: 'meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    pos: 'adjective',
    definition: 'Showing great attention to detail; very careful and precise.',
    example: 'The team performed meticulous code reviews for every client-side tool.',
    synonyms: ['scrupulous', 'painstaking', 'rigorous', 'exacting', 'punctilious'],
    antonyms: ['careless', 'sloppy', 'slapdash', 'negligent'],
  },
  novel: {
    word: 'novel',
    phonetic: '/ˈnɒv.əl/',
    pos: 'adjective',
    definition: 'New, unusual, or different from anything seen or known before.',
    example: 'They proposed a novel architecture combining edge computing with zero-server privacy.',
    synonyms: ['innovative', 'unique', 'fresh', 'unprecedented', 'original'],
    antonyms: ['familiar', 'commonplace', 'hackneyed', 'conventional', 'traditional'],
  },
  pragmatic: {
    word: 'pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    pos: 'adjective',
    definition: 'Dealing with things sensibly and realistically in a way based on practical rather than theoretical considerations.',
    example: 'A pragmatic developer prioritizes stable client-side execution over unnecessary server hops.',
    synonyms: ['practical', 'realistic', 'sensible', 'utilitarian', 'matter-of-fact'],
    antonyms: ['idealistic', 'impractical', 'theoretical', 'unrealistic', 'quixotic'],
  },
  resilient: {
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    pos: 'adjective',
    definition: 'Able to withstand or recover quickly from difficult conditions or strain.',
    example: 'The offline software architecture remains resilient even without an internet connection.',
    synonyms: ['tough', 'robust', 'tenacious', 'durable', 'buoyant'],
    antonyms: ['fragile', 'vulnerable', 'weak', 'delicate', 'susceptible'],
  },
  serendipity: {
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    pos: 'noun',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example: 'Finding an offline tool for the exact format needed was pure serendipity.',
    synonyms: ['fortune', 'happy chance', 'fluke', 'blessing', 'providence'],
    antonyms: ['misfortune', 'bad luck', 'affliction', 'adversity'],
  },
  tenacious: {
    word: 'tenacious',
    phonetic: '/təˈneɪ.ʃəs/',
    pos: 'adjective',
    definition: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent.',
    example: 'Her tenacious pursuit of high code quality transformed the entire codebase.',
    synonyms: ['persistent', 'resolute', 'determined', 'dogged', 'unyielding'],
    antonyms: ['yielding', 'irresolute', 'wavering', 'weak-willed'],
  },
  ubiquitous: {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    pos: 'adjective',
    definition: 'Present, appearing, or found everywhere at once.',
    example: 'Smartphones have become ubiquitous in modern metropolitan communication.',
    synonyms: ['omnipresent', 'pervasive', 'universal', 'worldwide', 'everywhere'],
    antonyms: ['rare', 'scarce', 'uncommon', 'isolated', 'sporadic'],
  },
  versatile: {
    word: 'versatile',
    phonetic: '/ˈvɜː.sə.taɪl/',
    pos: 'adjective',
    definition: 'Able to adapt or be adapted to many different functions or activities.',
    example: 'Toolstrum provides a versatile suite of 500 private on-device utilities.',
    synonyms: ['all-around', 'flexible', 'multipurpose', 'adaptable', 'resourceful'],
    antonyms: ['limited', 'inflexible', 'one-dimensional', 'specialized'],
  },
  zealous: {
    word: 'zealous',
    phonetic: '/ˈzel.əs/',
    pos: 'adjective',
    definition: 'Having or showing great energy or enthusiasm in pursuit of a cause or objective.',
    example: 'He was a zealous advocate for user data ownership and offline-first computing.',
    synonyms: ['fervent', 'passionate', 'ardent', 'enthusiastic', 'dedicated'],
    antonyms: ['apathetic', 'indifferent', 'lukewarm', 'passive', 'unenthusiastic'],
  },
};

// ========================================================
// 433 — UNIT CONVERSION REFERENCE
// ========================================================
interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  units: { name: string; symbol: string; factor: number }[];
  benchmarks: { label: string; equation: string }[];
}

const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length & Distance',
    baseUnit: 'm',
    units: [
      { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { name: 'Meter', symbol: 'm', factor: 1 },
      { name: 'Kilometer', symbol: 'km', factor: 1000 },
      { name: 'Inch', symbol: 'in', factor: 0.0254 },
      { name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { name: 'Mile', symbol: 'mi', factor: 1609.344 },
    ],
    benchmarks: [
      { label: '1 Meter', equation: '≈ 3.28084 Feet (39.37 Inches)' },
      { label: '1 Kilometer', equation: '≈ 0.621371 Miles (3,280.84 Ft)' },
      { label: '1 Inch', equation: '= Exactly 2.54 Centimeters' },
      { label: '1 Mile', equation: '= 5,280 Feet (1.60934 Km)' },
    ],
  },
  {
    id: 'mass',
    name: 'Mass & Weight',
    baseUnit: 'g',
    units: [
      { name: 'Milligram', symbol: 'mg', factor: 0.001 },
      { name: 'Gram', symbol: 'g', factor: 1 },
      { name: 'Kilogram', symbol: 'kg', factor: 1000 },
      { name: 'Metric Ton', symbol: 't', factor: 1000000 },
      { name: 'Ounce', symbol: 'oz', factor: 28.349523125 },
      { name: 'Pound', symbol: 'lb', factor: 453.59237 },
    ],
    benchmarks: [
      { label: '1 Kilogram', equation: '≈ 2.20462 Pounds (35.274 Oz)' },
      { label: '1 Pound', equation: '= 16 Ounces (453.592 Grams)' },
      { label: '1 Metric Ton', equation: '= 1,000 Kilograms (2,204.62 Lbs)' },
    ],
  },
  {
    id: 'volume',
    name: 'Volume & Capacity',
    baseUnit: 'ml',
    units: [
      { name: 'Milliliter', symbol: 'mL', factor: 1 },
      { name: 'Liter', symbol: 'L', factor: 1000 },
      { name: 'Cubic Meter', symbol: 'm³', factor: 1000000 },
      { name: 'US Fluid Ounce', symbol: 'fl oz', factor: 29.5735 },
      { name: 'US Cup', symbol: 'cup', factor: 236.588 },
      { name: 'US Pint', symbol: 'pt', factor: 473.176 },
      { name: 'US Gallon', symbol: 'gal', factor: 3785.41 },
    ],
    benchmarks: [
      { label: '1 Liter', equation: '= 1,000 mL (≈ 33.814 US Fl Oz)' },
      { label: '1 US Gallon', equation: '= 128 Fl Oz (≈ 3.78541 Liters)' },
      { label: '1 US Cup', equation: '= 8 Fl Oz (≈ 236.588 mL)' },
    ],
  },
  {
    id: 'speed',
    name: 'Speed & Velocity',
    baseUnit: 'm/s',
    units: [
      { name: 'Meter/Second', symbol: 'm/s', factor: 1 },
      { name: 'Kilometer/Hour', symbol: 'km/h', factor: 0.277778 },
      { name: 'Mile/Hour', symbol: 'mph', factor: 0.44704 },
      { name: 'Knot', symbol: 'kn', factor: 0.514444 },
    ],
    benchmarks: [
      { label: '100 km/h', equation: '≈ 62.137 mph (27.78 m/s)' },
      { label: '1 Knot', equation: '= 1 Nautical Mile/hr (1.852 km/h)' },
      { label: 'Speed of Sound', equation: '≈ 343 m/s (1,234.8 km/h at 20°C)' },
    ],
  },
  {
    id: 'digital',
    name: 'Digital Data',
    baseUnit: 'b',
    units: [
      { name: 'Byte', symbol: 'B', factor: 1 },
      { name: 'Kilobyte', symbol: 'KB', factor: 1024 },
      { name: 'Megabyte', symbol: 'MB', factor: 1048576 },
      { name: 'Gigabyte', symbol: 'GB', factor: 1073741824 },
      { name: 'Terabyte', symbol: 'TB', factor: 1099511627776 },
    ],
    benchmarks: [
      { label: '1 Megabyte', equation: '= 1,024 KB (1,048,576 Bytes)' },
      { label: '1 Gigabyte', equation: '= 1,024 MB (1,073,741,824 Bytes)' },
      { label: '1 Terabyte', equation: '= 1,024 GB (Approx. 250,000 Photos)' },
    ],
  },
];

export const UnitConversionReferenceTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [selectedCatId, setSelectedCatId] = useState('length');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnitIdx, setFromUnitIdx] = useState(2); // Meter for length

  const currentCategory = UNIT_CATEGORIES.find((c) => c.id === selectedCatId) || UNIT_CATEGORIES[0];
  const numVal = parseFloat(inputValue) || 0;
  const fromUnit = currentCategory.units[fromUnitIdx] || currentCategory.units[0];

  // Convert to base, then to all other units
  const baseValue = numVal * fromUnit.factor;

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {UNIT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setSelectedCatId(cat.id);
              setFromUnitIdx(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCatId === cat.id
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Converter Control Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Interactive {currentCategory.name} Converter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Quantity / Magnitude
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              From Unit
            </label>
            <select
              value={fromUnitIdx}
              onChange={(e) => setFromUnitIdx(Number(e.target.value))}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
            >
              {currentCategory.units.map((u, i) => (
                <option key={u.symbol} value={i}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Equivalent Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {currentCategory.units.map((unit) => {
          const converted = baseValue / unit.factor;
          const displayStr =
            Math.abs(converted) < 0.0001 || Math.abs(converted) > 1000000
              ? converted.toExponential(4)
              : parseFloat(converted.toFixed(6)).toString();

          return (
            <div
              key={unit.symbol}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 relative group"
            >
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>{unit.name}</span>
                <span className="font-mono text-pink-500 font-bold">{unit.symbol}</span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 dark:text-white truncate">
                {displayStr}
              </div>
              <button
                type="button"
                onClick={() => onCopy && onCopy(`${displayStr} ${unit.symbol}`)}
                className="text-[10px] text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1 pt-1"
              >
                <Copy className="w-2.5 h-2.5" />
                Copy
              </button>
            </div>
          );
        })}
      </div>

      {/* Universal Benchmarks */}
      <div className="p-5 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/60 dark:border-pink-900/40 space-y-2">
        <span className="text-xs font-bold text-pink-900 dark:text-pink-300 block">
          Key {currentCategory.name} Quick Standards
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {currentCategory.benchmarks.map((b, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <span className="font-bold text-pink-600 dark:text-pink-400">{b.label}:</span>
              <span>{b.equation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 434 — DICTIONARY
// ========================================================
export const DictionaryTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState('resilient');

  const words = Object.keys(OFFLINE_LEXICON);
  const filteredWords = words.filter((w) => w.toLowerCase().includes(query.toLowerCase()));
  const current = OFFLINE_LEXICON[selectedWord] || OFFLINE_LEXICON['resilient'];

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left Column: Word Search & List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search offline lexicon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Curated Lexicon ({filteredWords.length})
        </div>

        <div className="max-h-[460px] overflow-y-auto space-y-1 pr-1">
          {filteredWords.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setSelectedWord(w)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                selectedWord === w
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="capitalize">{w}</span>
              <span className={`text-[10px] ${selectedWord === w ? 'text-pink-100' : 'text-slate-400'}`}>
                {OFFLINE_LEXICON[w].pos.slice(0, 3)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Definition Card */}
      <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-black capitalize text-slate-900 dark:text-white tracking-tight">
                {current.word}
              </h3>
              <button
                type="button"
                onClick={() => speakWord(current.word)}
                className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 transition-all"
                title="Speak word"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs text-slate-500">{current.phonetic}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 italic">
                {current.pos}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCopy && onCopy(`${current.word}: ${current.definition}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
        </div>

        {/* Definition */}
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Definition
          </span>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {current.definition}
          </p>
        </div>

        {/* Example Sentence */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Example Context
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 italic">
            "{current.example}"
          </p>
        </div>

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              Synonyms ({current.synonyms.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {current.synonyms.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold text-rose-600 dark:text-rose-400 tracking-wider">
              Antonyms ({current.antonyms.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {current.antonyms.map((a) => (
                <span
                  key={a}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 435 — SYNONYM FINDER
// ========================================================
export const SynonymFinderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [inputWord, setInputWord] = useState('abundant');

  const clean = inputWord.toLowerCase().trim();
  const entry = OFFLINE_LEXICON[clean];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          Enter Target Word for Thesaurus Synonyms
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="e.g. resilient, meticulous, adaptable..."
            className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setInputWord('meticulous')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Random
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 self-center">Try:</span>
          {['benevolent', 'catalyst', 'eloquent', 'lucid', 'versatile', 'pragmatic'].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setInputWord(w)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-pink-50 hover:text-pink-600 text-[11px] font-medium transition-all"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xl font-bold capitalize text-slate-900 dark:text-white">
                {entry.word}
              </h4>
              <span className="text-xs text-slate-400 italic">{entry.pos} • {entry.definition}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              {entry.synonyms.length} Synonyms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entry.synonyms.map((syn, idx) => (
              <div
                key={syn}
                className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 capitalize">
                    {syn}
                  </div>
                  <div className="text-[10px] text-emerald-600/80 font-medium">
                    {idx < 2 ? 'Strong match' : 'Nuanced'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCopy && onCopy(syn)}
                  className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-600 dark:hover:bg-emerald-900/60 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          Word "{inputWord}" not in offline index. Try selecting one of the curated trending terms above.
        </div>
      )}
    </div>
  );
};

// ========================================================
// 436 — ANTONYM FINDER
// ========================================================
export const AntonymFinderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [inputWord, setInputWord] = useState('diligent');

  const clean = inputWord.toLowerCase().trim();
  const entry = OFFLINE_LEXICON[clean];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          Enter Word to Discover Direct Opposites & Antonyms
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            placeholder="e.g. candid, frugal, novel, zealous..."
            className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => setInputWord('frugal')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Random
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1 self-center">Try:</span>
          {['accurate', 'diligent', 'ephemeral', 'resilient', 'tenacious', 'ubiquitous'].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setInputWord(w)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-pink-50 hover:text-pink-600 text-[11px] font-medium transition-all"
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xl font-bold capitalize text-slate-900 dark:text-white">
                {entry.word}
              </h4>
              <span className="text-xs text-slate-400 italic">Opposites for {entry.pos}</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
              {entry.antonyms.length} Antonyms
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entry.antonyms.map((ant, idx) => (
              <div
                key={ant}
                className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200 capitalize">
                    {ant}
                  </div>
                  <div className="text-[10px] text-rose-600/80 font-medium">
                    {idx === 0 ? 'Polar opposite' : 'Contrasting'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onCopy && onCopy(ant)}
                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 dark:hover:bg-rose-900/60 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          Word "{inputWord}" not in offline index. Try selecting one of the curated trending terms above.
        </div>
      )}
    </div>
  );
};

// ========================================================
// 437 — WORD PRONUNCIATION
// ========================================================
export const WordPronunciationTool: React.FC<ToolProps> = () => {
  const [text, setText] = useState('serendipity');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(0.9);
  const [isPlaying, setIsPlaying] = useState(false);

  const clean = text.toLowerCase().trim();
  const knownPhonetic = OFFLINE_LEXICON[clean]?.phonetic || '/.../';

  const speak = () => {
    if (!text.trim() || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Volume2 className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Offline Speech Synthesis Pronunciation
          </span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Word or Short Phrase
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type any word to pronounce..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white"
          />
          {knownPhonetic !== '/.../' && (
            <div className="mt-2 text-xs font-mono text-pink-600 dark:text-pink-400">
              IPA Phonetic: {knownPhonetic}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Speech Speed</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {rate}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Voice Pitch</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {pitch}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={speak}
            disabled={!text.trim()}
            className="flex-1 py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            {isPlaying ? 'Speaking...' : 'Pronounce Audio'}
          </button>
          {isPlaying && (
            <button
              type="button"
              onClick={stop}
              className="px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
