import React from 'react';
import { useTaskLimit } from '../hooks/useTaskLimit';
import { useNavigate } from 'react-router-dom';

/**
 * Banner displayed in the dashboard header for free users,
 * showing their remaining task usage for the day.
 */
export const TaskLimitBanner: React.FC = () => {
  const { remaining, isPro, MAX_FREE_TASKS } = useTaskLimit();
  const navigate = useNavigate();

  if (isPro) {
    return null;
  }

  const percentage = Math.round((remaining / MAX_FREE_TASKS) * 100);

  let bannerBgClass = "bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-800/50";
  if (remaining <= 2 && remaining > 0) {
    bannerBgClass = "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50";
  } else if (remaining === 0) {
    bannerBgClass = "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50";
  }

  let barFillClass = "bg-blue-500";
  if (remaining === 3) barFillClass = "bg-blue-500";
  if (remaining === 2) barFillClass = "bg-amber-400";
  if (remaining === 1) barFillClass = "bg-orange-500";
  if (remaining === 0) barFillClass = "bg-red-500";

  let message = "";
  if (remaining === 5) message = "You have 5 free tasks remaining today.";
  else if (remaining === 4) message = "You have 4 free tasks remaining today.";
  else if (remaining === 3) message = "3 tasks left — upgrade for unlimited.";
  else if (remaining === 2) message = "⚠️ Only 2 tasks left today!";
  else if (remaining === 1) message = "⚠️ Last free task for today!";
  else if (remaining === 0) message = "🚫 Daily limit reached. Upgrade to continue.";

  return (
    <div className={`w-full rounded-xl p-4 transition-all border ${bannerBgClass}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h4 className={`font-bold ${remaining === 0 ? 'text-red-900 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {message}
          </h4>
          <p className={`text-sm mt-1 ${remaining === 0 ? 'text-red-700 dark:text-red-500' : 'text-slate-600 dark:text-slate-400'}`}>
            {remaining === 0 ? 'Upgrade to Pro to process more files instantly.' : 'Tasks automatically reset every midnight.'}
          </p>
        </div>
        {remaining <= 3 && (
          <button 
            onClick={() => navigate('/app/pricing')}
            className="shrink-0 bg-brand-gold hover:bg-yellow-500 text-yellow-900 font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
          >
            Upgrade for unlimited
          </button>
        )}
      </div>
      
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${barFillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
