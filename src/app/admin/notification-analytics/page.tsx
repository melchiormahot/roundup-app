'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface NotificationsData {
  byType: {
    type: string;
    sent: number;
    read: number;
    readRate: number;
  }[];
  timeline: {
    day: string;
    count: number;
  }[];
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

export default function AdminNotificationsPage() {
  const [data, setData] = useState<NotificationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=notifications')
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
          Loading notification analytics...
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

  const totalSent = data.byType.reduce((s, t) => s + t.sent, 0);
  const totalRead = data.byType.reduce((s, t) => s + t.read, 0);
  const overallReadRate = totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Notification Analytics
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {totalSent}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Total Sent
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-green)' }}>
            {totalRead}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Total Read
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--accent-blue)' }}>
            {overallReadRate}%
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Read Rate
          </div>
        </div>
      </div>

      {/* Sent count by type */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Sent vs Read by Type
        </h3>
        {data.byType.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.byType}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="type"
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
              <Legend wrapperStyle={{ color: colors.textSecondary, fontSize: '12px' }} />
              <Bar dataKey="sent" fill={colors.blue} name="Sent" radius={[4, 4, 0, 0]} />
              <Bar dataKey="read" fill={colors.green} name="Read" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Read rate by type */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Read Rate by Type
        </h3>
        {data.byType.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <div className="space-y-3">
            {data.byType.map((t) => (
              <div key={t.type} className="flex items-center gap-3">
                <span
                  className="text-xs w-24 truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t.type}
                </span>
                <div
                  className="flex-1 h-5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--progress-track)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${t.readRate}%`,
                      backgroundColor: colors.green,
                    }}
                  />
                </div>
                <span
                  className="text-xs tabular-nums w-10 text-right"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t.readRate}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Notification Timeline
        </h3>
        {data.timeline.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="day"
                tick={{ fill: colors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
                tickFormatter={(v) => v.slice(5)}
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
              <Line
                type="monotone"
                dataKey="count"
                stroke={colors.purple}
                strokeWidth={2}
                dot={{ fill: colors.purple, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
