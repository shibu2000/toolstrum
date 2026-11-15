import React, { useState, useMemo } from 'react';
import {
  Activity,
  Flame,
  Fuel,
  Gauge,
  Sparkles,
  Scale,
  Heart,
  Car,
} from 'lucide-react';

interface HealthLifestylePanelProps {
  defaultSubTool?: 'bmi' | 'calorie' | 'fuel' | 'mileage';
}

export const HealthLifestylePanel: React.FC<HealthLifestylePanelProps> = ({
  defaultSubTool = 'bmi',
}) => {
  const [activeTab, setActiveTab] = useState<'bmi' | 'calorie' | 'fuel' | 'mileage'>(defaultSubTool);

  // 1. BMI State
  const [bmiUnit, setBmiUnit] = useState<'metric' | 'imperial'>('metric');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightInches, setHeightInches] = useState<number>(69);

  const bmiResult = useMemo(() => {
    let bmi = 0;
    if (bmiUnit === 'metric') {
      const hM = heightCm / 100;
      if (hM > 0) bmi = weightKg / (hM * hM);
    } else {
      if (heightInches > 0) bmi = (703 * weightLbs) / (heightInches * heightInches);
    }
    const score = Number(bmi.toFixed(1));
    let label = 'Normal weight';
    let color = 'text-emerald-500';
    if (score < 18.5) { label = 'Underweight'; color = 'text-sky-500'; }
    else if (score >= 25 && score < 30) { label = 'Overweight'; color = 'text-amber-500'; }
    else if (score >= 30) { label = 'Obese'; color = 'text-rose-500'; }

    return { score, label, color };
  }, [bmiUnit, weightKg, heightCm, weightLbs, heightInches]);

  // 2. Calorie & BMR State
  const [calAge, setCalAge] = useState<number>(28);
  const [calGender, setCalGender] = useState<'male' | 'female'>('male');
  const [calWeight, setCalWeight] = useState<number>(75); // kg
  const [calHeight, setCalHeight] = useState<number>(178); // cm
  const [calActivity, setCalActivity] = useState<number>(1.375); // light exercise

  const calorieResult = useMemo(() => {
    // Mifflin-St Jeor Formula
    let bmr = 10 * calWeight + 6.25 * calHeight - 5 * calAge;
    bmr += calGender === 'male' ? 5 : -161;
    const tdee = bmr * calActivity;

    return {
      bmr: Math.round(bmr),
      maintenance: Math.round(tdee),
      mildLoss: Math.round(tdee - 250),
      weightLoss: Math.round(tdee - 500),
      weightGain: Math.round(tdee + 500),
    };
  }, [calAge, calGender, calWeight, calHeight, calActivity]);

  // 3. Fuel Cost State
  const [fuelDistKm, setFuelDistKm] = useState<number>(350);
  const [fuelMileageKmPerL, setFuelMileageKmPerL] = useState<number>(14);
  const [fuelPricePerL, setFuelPricePerL] = useState<number>(1.45);

  const fuelCostResult = useMemo(() => {
    const m = Math.max(0.1, fuelMileageKmPerL);
    const liters = fuelDistKm / m;
    const totalCost = liters * fuelPricePerL;
    const costPerKm = fuelDistKm > 0 ? totalCost / fuelDistKm : 0;
    return {
      liters: liters.toFixed(1),
      totalCost: totalCost.toFixed(2),
      costPerKm: costPerKm.toFixed(3),
    };
  }, [fuelDistKm, fuelMileageKmPerL, fuelPricePerL]);

  // 4. Mileage State
  const [startOdo, setStartOdo] = useState<number>(45000);
  const [endOdo, setEndOdo] = useState<number>(45450);
  const [fuelFilledLiters, setFuelFilledLiters] = useState<number>(32);

  const mileageResult = useMemo(() => {
    const dist = Math.max(0, endOdo - startOdo);
    const f = Math.max(0.1, fuelFilledLiters);
    const kmPerL = dist / f;
    const mpgUS = kmPerL * 2.35215;
    const lPer100 = dist > 0 ? (f / dist) * 100 : 0;
    return {
      distance: dist,
      kmPerL: kmPerL.toFixed(2),
      mpgUS: mpgUS.toFixed(1),
      lPer100: lPer100.toFixed(2),
    };
  }, [startOdo, endOdo, fuelFilledLiters]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {activeTab === 'bmi' ? (
              <Activity className="w-5 h-5" />
            ) : activeTab === 'calorie' ? (
              <Flame className="w-5 h-5" />
            ) : activeTab === 'fuel' ? (
              <Fuel className="w-5 h-5" />
            ) : (
              <Car className="w-5 h-5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Health, Fitness & Vehicle Fuel Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              BMI metric/imperial body index, Mifflin-St Jeor calorie targets, road trip fuel expense, and vehicle mileage estimators.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('bmi')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'bmi'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            BMI Calculator
          </button>
          <button
            onClick={() => setActiveTab('calorie')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'calorie'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Calorie / BMR
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'fuel'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Fuel Cost
          </button>
          <button
            onClick={() => setActiveTab('mileage')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'mileage'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Vehicle Mileage
          </button>
        </div>
      </div>

      {/* 1. BMI CALCULATOR */}
      {activeTab === 'bmi' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBmiUnit('metric')}
                className={`flex-1 py-1.5 rounded font-bold ${
                  bmiUnit === 'metric' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Metric (kg / cm)
              </button>
              <button
                onClick={() => setBmiUnit('imperial')}
                className={`flex-1 py-1.5 rounded font-bold ${
                  bmiUnit === 'imperial' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Imperial (lbs / in)
              </button>
            </div>

            {bmiUnit === 'metric' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 uppercase block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 uppercase block mb-1">Weight (lbs)</label>
                  <input
                    type="number"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase block mb-1">Height (inches)</label>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-3">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Body Mass Index (BMI)</span>
              <p className="text-5xl font-black font-mono mt-1">{bmiResult.score}</p>
            </div>
            <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-500">WHO Classification:</span>
              <strong className={`text-base font-bold ${bmiResult.color}`}>{bmiResult.label}</strong>
            </div>
          </div>
        </div>
      )}

      {/* 2. CALORIE / BMR CALCULATOR */}
      {activeTab === 'calorie' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Age</label>
                <input
                  type="number"
                  value={calAge}
                  onChange={(e) => setCalAge(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Gender</label>
                <select
                  value={calGender}
                  onChange={(e) => setCalGender(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={calWeight}
                  onChange={(e) => setCalWeight(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Height (cm)</label>
              <input
                type="number"
                value={calHeight}
                onChange={(e) => setCalHeight(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Activity Level</label>
              <select
                value={calActivity}
                onChange={(e) => setCalActivity(parseFloat(e.target.value) || 1.2)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value={1.2}>Sedentary (desk job, no exercise)</option>
                <option value={1.375}>Light (exercise 1-3 days/week)</option>
                <option value={1.55}>Moderate (exercise 3-5 days/week)</option>
                <option value={1.725}>Very Active (hard exercise 6-7 days/week)</option>
              </select>
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-3">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Daily Maintenance TDEE</span>
              <p className="text-4xl font-black font-mono mt-1">{calorieResult.maintenance.toLocaleString()} kcal</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Basal Metabolic Rate (BMR)</span>
                <p className="font-mono font-bold">{calorieResult.bmr} kcal</p>
              </div>
              <div>
                <span className="text-slate-500">Weight Loss (-1 lb/wk)</span>
                <p className="font-mono font-bold text-emerald-600">{calorieResult.weightLoss} kcal</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FUEL COST */}
      {activeTab === 'fuel' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Trip Distance (km)</label>
              <input
                type="number"
                value={fuelDistKm}
                onChange={(e) => setFuelDistKm(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Fuel Economy (km / Liter)</label>
              <input
                type="number"
                step="0.1"
                value={fuelMileageKmPerL}
                onChange={(e) => setFuelMileageKmPerL(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Fuel Price ($ / Liter)</label>
              <input
                type="number"
                step="0.01"
                value={fuelPricePerL}
                onChange={(e) => setFuelPricePerL(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Trip Fuel Cost</span>
              <p className="text-4xl font-black font-mono mt-1">${fuelCostResult.totalCost}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Fuel Needed</span>
                <p className="text-base font-bold font-mono">{fuelCostResult.liters} Liters</p>
              </div>
              <div>
                <span className="text-slate-500">Cost per Kilometer</span>
                <p className="text-base font-bold font-mono">${fuelCostResult.costPerKm}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. VEHICLE MILEAGE */}
      {activeTab === 'mileage' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Start Odometer (km)</label>
                <input
                  type="number"
                  value={startOdo}
                  onChange={(e) => setStartOdo(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">End Odometer (km)</label>
                <input
                  type="number"
                  value={endOdo}
                  onChange={(e) => setEndOdo(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Fuel Filled (Liters)</label>
              <input
                type="number"
                step="0.1"
                value={fuelFilledLiters}
                onChange={(e) => setFuelFilledLiters(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Fuel Mileage</span>
              <p className="text-4xl font-black font-mono mt-1">{mileageResult.kmPerL} km/L</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Miles Per Gallon (US)</span>
                <p className="text-base font-bold font-mono">{mileageResult.mpgUS} MPG</p>
              </div>
              <div>
                <span className="text-slate-500">Consumption Rate</span>
                <p className="text-base font-bold font-mono">{mileageResult.lPer100} L/100km</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
