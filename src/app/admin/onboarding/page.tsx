'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ArrowRight } from 'lucide-react';

interface FunnelStep {
  step: number;
  label: string;
  count: number;
  dropOff: number;
  dropOffPct: number;
}

interface OnboardingData {
  totalSignups: number;
  completed: number;
  conversionRate: number;
  funnel: FunnelStep[];
}

function useChartColors() {
  const [colors, setColors] = useState({
    green: '#86efac',
    blue: '#60a5fa',
    purple: '#c084fc',
    yellow: '#fbbf24',
    orange: '#fb923c',
    red: '#fca5a5',
    border: '#33302b',
    textSecondary: '#a8a29e',
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      green: style.getPropertyValue('--accent-green').trim() || '#86efac',
      blue: style.getPropertyValue('--accent-blue').trim() || '#60a5fa',
      purple: style.getPropertyValue('--accent-purple').trim() || '#c084fc',
      yellow: style.getPropertyValue('--accent-yellow').trim() || '#fbbf24',
      orange: style.getPropertyValue('--accent-orange').trim() || '#fb923c',
      red: style.getPropertyValue('--accent-red').trim() || '#fca5a5',
      border: style.getPropertyValue('--border-primary').trim() || '#33302b',
      textSecondary: style.getPropertyValue('--text-secondary').trim() || '#a8a29e',
    });
  }, []);

  return colors;
}

export default function AdminOnboardingPage() {
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=onboarding')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading onboarding data...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
        No data yet
      </div>
    );
  }

  const stepColors = [colors.green, colors.blue, colors.purple, colors.yellow];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Onboarding Funnel
      </h1>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {data.totalSignups}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Total Signups
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-green)' }}>
            {data.completed}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Completed
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-blue)' }}>
            {data.conversionRate}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Conversion Rate
          </div>
        </div>
      </div>

      {/* Visual funnel */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Funnel Visualization
        </h3>

        <div className="flex flex-col md:flex-row items-stretch gap-2">
          {data.funnel.map((step, i) => {
            const maxCount = data.totalSignups || 1;
            const widthPct = Math.max(20, (step.count / maxCount) * 100);

            return (
              <div key={step.step} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative">
                  <div
                    className="rounded-lg py-6 px-3 text-center transition-all"
                    style={{
                      backgroundColor: stepColors[i] + '20',
                      border: `2px solid ${stepColors[i]}`,
                      width: `${widthPct}%`,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      minWidth: '80px',
                    }}
                  >
                    <div className="text-2xl font-bold tabular-nums" style={{ color: stepColors[i] }}>
                      {step.count}
                    </div>
                    <div className="text-xs font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {step.label}
                    </div>
                  </div>
                </div>

                {step.dropOff > 0 && (
                  <div
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: colors.red + '20',
                      color: colors.red,
                    }}
                  >
                    -{step.dropOffPct}% drop-off
                  </div>
                )}

                {i < data.funnel.length - 1 && (
                  <ArrowRight
                    size={16}
                    className="hidden md:block absolute right-0 top-1/2"
                    style={{ color: 'var(--text-dim)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Step Completion
        </h3>
        {data.funnel.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.funnel}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="label"
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
              />
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card-inner)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.funnel.map((_, idx) => (
                  <Cell key={idx} fill={stepColors[idx % stepColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
