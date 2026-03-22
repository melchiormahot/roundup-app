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

interface ProgressionData {
  levelDistribution: { level: string; count: number }[];
  featureUnlocks: {
    feature: string;
    level: number;
    unlocked: number;
    rate: number;
  }[];
  dropOff: { level: number; count: number }[];
}

function useChartColors() {
  const [colors, setColors] = useState({
    green: '#86efac',
    blue: '#60a5fa',
    purple: '#c084fc',
    yellow: '#fbbf24',
    orange: '#fb923c',
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
      border: style.getPropertyValue('--border-primary').trim() || '#33302b',
      textSecondary: style.getPropertyValue('--text-secondary').trim() || '#a8a29e',
    });
  }, []);

  return colors;
}

export default function AdminProgressionPage() {
  const [data, setData] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=progression')
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
          Loading progression data...
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

  const levelColors = [colors.green, colors.blue, colors.purple, colors.yellow];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        User Progression
      </h1>

      {/* Level distribution */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Level Distribution
        </h3>
        {data.levelDistribution.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.levelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="level"
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
                {data.levelDistribution.map((_, idx) => (
                  <Cell key={idx} fill={levelColors[idx % levelColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Feature unlock rates */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Feature Unlock Rates
        </h3>
        {data.featureUnlocks.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <div className="space-y-3">
            {data.featureUnlocks.map((f) => (
              <div key={f.feature} className="flex items-center gap-3">
                <span
                  className="text-xs w-40 truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {f.feature}
                </span>
                <div
                  className="flex-1 h-5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--progress-track)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${f.rate}%`,
                      backgroundColor:
                        levelColors[(f.level - 1) % levelColors.length],
                    }}
                  />
                </div>
                <span
                  className="text-xs tabular-nums w-16 text-right"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {f.unlocked} ({f.rate}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop-off by level */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Users Stopped at Each Level
        </h3>
        {data.dropOff.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data.dropOff.map((d) => ({
                level: `Level ${d.level}`,
                count: d.count,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="level"
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
                {data.dropOff.map((_, idx) => (
                  <Cell key={idx} fill={levelColors[idx % levelColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Level thresholds info */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Level Thresholds
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { level: 1, days: 0, donated: 0, label: 'Default' },
            { level: 2, days: 7, donated: 10, label: 'Day 7+ & EUR 10+' },
            { level: 3, days: 30, donated: 50, label: 'Day 30+ & EUR 50+' },
            { level: 4, days: 90, donated: 200, label: 'Day 90+ & EUR 200+' },
          ].map((t) => (
            <div
              key={t.level}
              className="rounded-lg p-3"
              style={{
                backgroundColor: levelColors[(t.level - 1) % levelColors.length] + '15',
                border: `1px solid ${levelColors[(t.level - 1) % levelColors.length]}40`,
              }}
            >
              <div
                className="text-sm font-bold"
                style={{
                  color: levelColors[(t.level - 1) % levelColors.length],
                }}
              >
                Level {t.level}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
