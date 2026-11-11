import React, { useState } from 'react';
import {
  DollarSign,
  Zap,
  Gauge,
  Fuel,
  Check,
  Copy,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 335 — FUEL COST CALCULATOR
// ========================================================
export const FuelCostCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [distance, setDistance] = useState(350);
  const [unit, setUnit] = useState<'km' | 'miles'>('km');
  const [consumption, setConsumption] = useState(7.5); // L/100km or MPG
  const [fuelPrice, setFuelPrice] = useState(1.65); // price per liter or gallon

  const calculateFuel = () => {
    let fuelNeeded = 0;
    if (unit === 'km') {
      fuelNeeded = (distance / 100) * consumption;
    } else {
      // distance in miles, consumption in MPG
      fuelNeeded = consumption > 0 ? distance / consumption : 0;
    }
    const totalCost = fuelNeeded * fuelPrice;
    const costPerDistance = distance > 0 ? totalCost / distance : 0;

    return {
      fuelNeeded: fuelNeeded.toFixed(2),
      totalCost: totalCost.toFixed(2),
      costPerDist: costPerDistance.toFixed(3),
    };
  };

  const res = calculateFuel();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Trip & Fuel Parameters</h3>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setUnit('km'); setConsumption(7.5); }}
              className={`px-2.5 py-1 rounded-lg ${unit === 'km' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Metric (km / L)
            </button>
            <button
              onClick={() => { setUnit('miles'); setConsumption(30); }}
              className={`px-2.5 py-1 rounded-lg ${unit === 'miles' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Imperial (mi / gal)
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Trip Distance ({unit})</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(Math.max(0, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">
            Fuel Efficiency ({unit === 'km' ? 'Litres per 100 km' : 'Miles per Gallon (MPG)'})
          </label>
          <input
            type="number"
            step="0.1"
            value={consumption}
            onChange={(e) => setConsumption(Math.max(0.1, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">
            Fuel Price per {unit === 'km' ? 'Litre' : 'Gallon'} ($)
          </label>
          <input
            type="number"
            step="0.01"
            value={fuelPrice}
            onChange={(e) => setFuelPrice(Math.max(0, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Trip Cost Breakdown
        </span>

        <div>
          <span className="text-xs text-slate-400">Total Fuel Cost:</span>
          <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            ${res.totalCost}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            ${res.costPerDist} per {unit === 'km' ? 'km' : 'mile'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1 text-xs">
          <span className="text-slate-400 font-bold uppercase">Estimated Fuel Consumption:</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {res.fuelNeeded} {unit === 'km' ? 'Litres' : 'Gallons'}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 336 — MILEAGE / FUEL ECONOMY CALCULATOR
// ========================================================
export const MileageCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [distDriven, setDistDriven] = useState(480);
  const [distUnit, setDistUnit] = useState<'km' | 'miles'>('km');
  const [fuelUsed, setFuelUsed] = useState(36);
  const [fuelUnit, setFuelUnit] = useState<'liters' | 'gallons'>('liters');

  // Convert everything to standard km and Liters
  const km = distUnit === 'km' ? distDriven : distDriven * 1.60934;
  const liters = fuelUnit === 'liters' ? fuelUsed : fuelUsed * 3.78541;

  const lPer100km = km > 0 ? (liters / km) * 100 : 0;
  const kmPerL = liters > 0 ? km / liters : 0;
  const mpgUS = liters > 0 ? (km * 0.621371) / (liters * 0.264172) : 0;
  const mpgUK = liters > 0 ? (km * 0.621371) / (liters * 0.219969) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mileage Parameters</h3>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-500">Distance Driven</label>
            <select
              value={distUnit}
              onChange={(e) => setDistUnit(e.target.value as any)}
              className="text-xs p-1 rounded bg-slate-100 dark:bg-slate-800 font-bold"
            >
              <option value="km">Kilometers (km)</option>
              <option value="miles">Miles (mi)</option>
            </select>
          </div>
          <input
            type="number"
            value={distDriven}
            onChange={(e) => setDistDriven(Math.max(0, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-slate-500">Fuel Used</label>
            <select
              value={fuelUnit}
              onChange={(e) => setFuelUnit(e.target.value as any)}
              className="text-xs p-1 rounded bg-slate-100 dark:bg-slate-800 font-bold"
            >
              <option value="liters">Litres (L)</option>
              <option value="gallons">Gallons (US gal)</option>
            </select>
          </div>
          <input
            type="number"
            value={fuelUsed}
            onChange={(e) => setFuelUsed(Math.max(0.1, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Calculated Fuel Economy
        </span>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">US MPG:</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              {mpgUS.toFixed(1)} MPG
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">UK MPG:</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {mpgUK.toFixed(1)} MPG
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Consumption:</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {lPer100km.toFixed(1)} L/100km
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Distance / Liter:</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {kmPerL.toFixed(1)} km/L
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 337 — ELECTRICITY BILL ESTIMATOR
// ========================================================
export const ElectricityBillTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [wattage, setWattage] = useState(1500); // e.g. space heater or A/C
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [costPerKwh, setCostPerKwh] = useState(0.18); // $0.18 / kWh

  const dailyKwh = (wattage * hoursPerDay) / 1000;
  const monthlyKwh = dailyKwh * 30;
  const yearlyKwh = dailyKwh * 365;

  const dailyCost = dailyKwh * costPerKwh;
  const monthlyCost = monthlyKwh * costPerKwh;
  const yearlyCost = yearlyKwh * costPerKwh;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appliance Power Usage</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">
            Appliance Wattage (Watts)
          </label>
          <input
            type="number"
            value={wattage}
            onChange={(e) => setWattage(Math.max(1, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
          <div className="flex gap-1.5 mt-2 flex-wrap text-[11px]">
            {[
              { name: 'Laptop', w: 65 },
              { name: 'TV', w: 100 },
              { name: 'Fridge', w: 200 },
              { name: 'Microwave', w: 1000 },
              { name: 'A/C', w: 1800 },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => setWattage(p.w)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
              >
                {p.name} ({p.w}W)
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">
            Usage Hours per Day: {hoursPerDay} hrs
          </label>
          <input
            type="range"
            min="0.5"
            max="24"
            step="0.5"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">
            Electricity Rate ($ per kWh)
          </label>
          <input
            type="number"
            step="0.01"
            value={costPerKwh}
            onChange={(e) => setCostPerKwh(Math.max(0.01, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Estimated Operating Cost
        </span>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Per Day</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              ${dailyCost.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 text-center border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Per Month</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              ${monthlyCost.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Per Year</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              ${yearlyCost.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Daily Power:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{dailyKwh.toFixed(2)} kWh/day</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Annual Energy Consumption:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{yearlyKwh.toFixed(0)} kWh/year</span>
          </div>
        </div>
      </div>
    </div>
  );
};
