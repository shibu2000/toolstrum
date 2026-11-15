import React from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { StandardScientificCalcPanel } from './calculators/StandardScientificCalcPanel';
import { FractionsRatiosPanel } from './calculators/FractionsRatiosPanel';
import { FinancialLoanPanel } from './calculators/FinancialLoanPanel';
import { ShoppingUtilityPanel } from './calculators/ShoppingUtilityPanel';
import { DateTimeCalcPanel } from './calculators/DateTimeCalcPanel';
import { ClockTimerPanel } from './calculators/ClockTimerPanel';
import { UnitConverterPanel } from './calculators/UnitConverterPanel';
import { NumericsRandomPanel } from './calculators/NumericsRandomPanel';
import { HealthLifestylePanel } from './calculators/HealthLifestylePanel';

interface CalculatorsWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const CalculatorsWorkspace: React.FC<CalculatorsWorkspaceProps> = ({
  toolId,
  accentColor = '#F59E0B',
}) => {
  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CalcIcon className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Calculators & Math Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Standard & scientific calculators, loan EMIs, investments, date math, unit converters, and lifestyle metrics. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 301, 302: STANDARD & SCIENTIFIC CALCULATORS              */}
      {/* ======================================================== */}
      {toolId === 301 && <StandardScientificCalcPanel defaultMode="standard" />}
      {toolId === 302 && <StandardScientificCalcPanel defaultMode="scientific" />}

      {/* ======================================================== */}
      {/* 303, 337, 338, 339, 349: SHOPPING & UTILITY              */}
      {/* ======================================================== */}
      {toolId === 303 && <ShoppingUtilityPanel defaultSubTool="percentage" />}
      {toolId === 337 && <ShoppingUtilityPanel defaultSubTool="electricity" />}
      {toolId === 338 && <ShoppingUtilityPanel defaultSubTool="tip" />}
      {toolId === 339 && <ShoppingUtilityPanel defaultSubTool="tip" />}
      {toolId === 349 && <ShoppingUtilityPanel defaultSubTool="unitprice" />}

      {/* ======================================================== */}
      {/* 304-311, 317, 318, 350: FINANCIAL & LOAN ENGINES         */}
      {/* ======================================================== */}
      {toolId === 304 && <FinancialLoanPanel defaultSubTool="discount" />}
      {toolId === 305 && <FinancialLoanPanel defaultSubTool="gst" />}
      {toolId === 306 && <FinancialLoanPanel defaultSubTool="gst" />}
      {toolId === 307 && <FinancialLoanPanel defaultSubTool="emi" />}
      {toolId === 308 && <FinancialLoanPanel defaultSubTool="interest" />}
      {toolId === 309 && <FinancialLoanPanel defaultSubTool="interest" />}
      {toolId === 310 && <FinancialLoanPanel defaultSubTool="sip" />}
      {toolId === 311 && <FinancialLoanPanel defaultSubTool="inflation" />}
      {toolId === 317 && <FinancialLoanPanel defaultSubTool="salary" />}
      {toolId === 318 && <FinancialLoanPanel defaultSubTool="overtime" />}
      {toolId === 350 && <FinancialLoanPanel defaultSubTool="breakeven" />}

      {/* ======================================================== */}
      {/* 312-316, 348: DATE & TIME SCHEDULING                    */}
      {/* ======================================================== */}
      {toolId === 312 && <DateTimeCalcPanel defaultSubTool="age" />}
      {toolId === 313 && <DateTimeCalcPanel defaultSubTool="datediff" />}
      {toolId === 314 && <DateTimeCalcPanel defaultSubTool="dateadd" />}
      {toolId === 315 && <DateTimeCalcPanel defaultSubTool="duration" />}
      {toolId === 316 && <DateTimeCalcPanel defaultSubTool="workhours" />}
      {toolId === 348 && <DateTimeCalcPanel defaultSubTool="calendarweek" />}

      {/* ======================================================== */}
      {/* 319-327: UNIT CONVERTERS                                 */}
      {/* ======================================================== */}
      {toolId === 319 && <UnitConverterPanel defaultCategory="length" />}
      {toolId === 320 && <UnitConverterPanel defaultCategory="length" />}
      {toolId === 321 && <UnitConverterPanel defaultCategory="weight" />}
      {toolId === 322 && <UnitConverterPanel defaultCategory="temperature" />}
      {toolId === 323 && <UnitConverterPanel defaultCategory="area" />}
      {toolId === 324 && <UnitConverterPanel defaultCategory="volume" />}
      {toolId === 325 && <UnitConverterPanel defaultCategory="speed" />}
      {toolId === 326 && <UnitConverterPanel defaultCategory="pressure" />}
      {toolId === 327 && <UnitConverterPanel defaultCategory="data_storage" />}

      {/* ======================================================== */}
      {/* 328, 340-343: NUMERICS, WORDS, ROMAN & RANDOM           */}
      {/* ======================================================== */}
      {toolId === 328 && <NumericsRandomPanel defaultSubTool="base" />}
      {toolId === 340 && <NumericsRandomPanel defaultSubTool="words" />}
      {toolId === 341 && <NumericsRandomPanel defaultSubTool="roman" />}
      {toolId === 342 && <NumericsRandomPanel defaultSubTool="random" />}
      {toolId === 343 && <NumericsRandomPanel defaultSubTool="dice" />}

      {/* ======================================================== */}
      {/* 329-332: FRACTIONS, RATIOS, STATS & PROBABILITY         */}
      {/* ======================================================== */}
      {toolId === 329 && <FractionsRatiosPanel defaultSubTool="fraction" />}
      {toolId === 330 && <FractionsRatiosPanel defaultSubTool="ratio" />}
      {toolId === 331 && <FractionsRatiosPanel defaultSubTool="average" />}
      {toolId === 332 && <FractionsRatiosPanel defaultSubTool="probability" />}

      {/* ======================================================== */}
      {/* 333-336: HEALTH, FITNESS & VEHICLE FUEL                  */}
      {/* ======================================================== */}
      {toolId === 333 && <HealthLifestylePanel defaultSubTool="bmi" />}
      {toolId === 334 && <HealthLifestylePanel defaultSubTool="calorie" />}
      {toolId === 335 && <HealthLifestylePanel defaultSubTool="fuel" />}
      {toolId === 336 && <HealthLifestylePanel defaultSubTool="mileage" />}

      {/* ======================================================== */}
      {/* 344-347: CLOCK, STOPWATCH & TIMERS                       */}
      {/* ======================================================== */}
      {toolId === 344 && <ClockTimerPanel defaultSubTool="stopwatch" />}
      {toolId === 345 && <ClockTimerPanel defaultSubTool="timer" />}
      {toolId === 346 && <ClockTimerPanel defaultSubTool="alarm" />}
      {toolId === 347 && <ClockTimerPanel defaultSubTool="worldclock" />}
    </div>
  );
};
