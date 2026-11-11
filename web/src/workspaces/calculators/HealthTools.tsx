import React, { useState } from 'react';
import { Activity, Flame, Scale, Check, Copy } from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 333 — BMI CALCULATOR
// ========================================================
export const BmiCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [unitMode, setUnitMode] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);
  const [weightLbs, setWeightLbs] = useState(154);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);

  let bmi = 0;
  let healthyMinKg = 0;
  let healthyMaxKg = 0;

  if (unitMode === 'metric') {
    const hM = heightCm / 100;
    bmi = hM > 0 ? weightKg / (hM * hM) : 0;
    healthyMinKg = 18.5 * (hM * hM);
    healthyMaxKg = 24.9 * (hM * hM);
  } else {
    const totalInches = heightFt * 12 + heightIn;
    bmi = totalInches > 0 ? (weightLbs / (totalInches * totalInches)) * 703 : 0;
  }

  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-500' };
    if (val < 25) return { label: 'Normal Weight', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-500' };
    return { label: 'Obese', color: 'text-rose-500' };
  };

  const cat = getBmiCategory(bmi);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Body Measurements</h3>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => setUnitMode('metric')}
              className={`px-2.5 py-1 rounded-lg ${unitMode === 'metric' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Metric (kg, cm)
            </button>
            <button
              onClick={() => setUnitMode('imperial')}
              className={`px-2.5 py-1 rounded-lg ${unitMode === 'imperial' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Imperial (lbs, ft-in)
            </button>
          </div>
        </div>

        {unitMode === 'metric' ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Weight (lbs)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Math.max(1, Number(e.target.value)))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Feet</label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Inches</label>
                <input
                  type="number"
                  max="11"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-5">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          BMI Index Result
        </span>

        <div>
          <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
            {bmi.toFixed(1)}
          </div>
          <p className={`text-base font-bold mt-1 ${cat.color}`}>{cat.label}</p>
        </div>

        {/* Visual BMI Category Bar */}
        <div className="space-y-1">
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
            <div className="bg-sky-400 w-1/4" title="Underweight (< 18.5)" />
            <div className="bg-emerald-500 w-1/4" title="Normal (18.5 - 24.9)" />
            <div className="bg-amber-400 w-1/4" title="Overweight (25 - 29.9)" />
            <div className="bg-rose-500 w-1/4" title="Obese (≥ 30)" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>&lt;18.5</span>
            <span>18.5–24.9</span>
            <span>25–29.9</span>
            <span>≥30</span>
          </div>
        </div>

        {unitMode === 'metric' && (
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
            <span className="text-slate-400">Normal Weight Range for Height:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">
              {healthyMinKg.toFixed(1)} kg – {healthyMaxKg.toFixed(1)} kg
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 334 — CALORIE ESTIMATOR (BMR & TDEE)
// ========================================================
export const CalorieEstimatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState(28);
  const [weightKg, setWeightKg] = useState(72);
  const [heightCm, setHeightCm] = useState(176);
  const [activity, setActivity] = useState<number>(1.375); // Lightly active

  // Mifflin-St Jeor Equation
  // BMR Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // BMR Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  const bmr =
    gender === 'male'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const tdee = Math.round(bmr * activity);
  const weightLoss = Math.max(1200, tdee - 500);
  const weightGain = tdee + 500;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setGender('male')}
            className={`py-2 rounded-xl text-xs font-bold ${
              gender === 'male' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Male
          </button>
          <button
            onClick={() => setGender('female')}
            className={`py-2 rounded-xl text-xs font-bold ${
              gender === 'female' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            Female
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Math.max(10, Number(e.target.value)))}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(20, Number(e.target.value)))}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(Math.max(50, Number(e.target.value)))}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Activity Level</label>
          <select
            value={activity}
            onChange={(e) => setActivity(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          >
            <option value={1.2}>Sedentary (Little or no exercise)</option>
            <option value={1.375}>Lightly active (Exercise 1-3 days/week)</option>
            <option value={1.55}>Moderately active (Exercise 3-5 days/week)</option>
            <option value={1.725}>Very active (Hard exercise 6-7 days/week)</option>
            <option value={1.9}>Extra active (Physical job or 2x training)</option>
          </select>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Daily Caloric Needs (TDEE)
        </span>

        <div>
          <span className="text-xs text-slate-400">Maintenance Calories:</span>
          <div className="text-4xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
            {tdee} kcal / day
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Basal Metabolic Rate (BMR): {Math.round(bmr)} kcal
          </p>
        </div>

        <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30">
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">Weight Loss (-0.5 kg/week)</span>
              <p className="text-[11px] text-slate-500">Deficit of 500 kcal/day</p>
            </div>
            <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">{weightLoss} kcal</span>
          </div>

          <div className="flex justify-between items-center p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-400/30">
            <div>
              <span className="font-bold text-sky-700 dark:text-sky-300">Weight Gain (+0.5 kg/week)</span>
              <p className="text-[11px] text-slate-500">Surplus of 500 kcal/day</p>
            </div>
            <span className="text-lg font-black font-mono text-sky-600 dark:text-sky-400">{weightGain} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
