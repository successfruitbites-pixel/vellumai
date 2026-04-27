import React from 'react';
import { useTaskLimit } from '../hooks/useTaskLimit';
import { useNavigate } from 'react-router-dom';

/**
 * Banner displayed in the dashboard header for free users,
 * showing their remaining task usage for the day.
 */
export const TaskLimitBanner: React.FC = () => {
  const { count, remaining, isPro, MAX_FREE_TASKS } = useTaskLimit();
  const navigate = useNavigate();

  if (isPro) {
    return null;
  }

  const isExhausted = remaining === 0;
  const percentage = Math.min((count / MAX_FREE_TASKS) * 100, 100);

  return (
    <div className={`w-full rounded-xl p-4 transition-all border ${isExhausted ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <h4 className={`font-bold ${isExhausted ? 'text-amber-900 dark:text-amber-400' : 'text-blue-900 dark:text-blue-400'}`}>
            {count} of {MAX_FREE_TASKS} free tasks used today
          </h4>
          <p className={`text-sm ${isExhausted ? 'text-amber-700 dark:text-amber-500' : 'text-blue-700 dark:text-blue-500'}`}>
            {isExhausted ? 'Upgrade to Pro to process more files instantly.' : 'Tasks automatically reset every midnight.'}
          </p>
        </div>
        {isExhausted && (
          <button 
            onClick={() => navigate('/app/pricing')}
            className="shrink-0 bg-brand-gold hover:bg-yellow-500 text-yellow-900 font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
          >
            Upgrade for unlimited tasks
          </button>
        )}
      </div>
      
      <div className={`h-2 w-full rounded-full overflow-hidden ${isExhausted ? 'bg-amber-200 dark:bg-amber-900/30' : 'bg-blue-200 dark:bg-blue-900/30'}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ease-out ${isExhausted ? 'bg-amber-500' : 'bg-brand-primary'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
