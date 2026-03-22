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
} from 'recharts';
import { ArrowUpDown, Heart } from 'lucide-react';

interface CharityRow {
  id: string;
  name: string;
  category: string | null;
  totalReceived: number;
  userCount: number;
  avgAllocation: number;
}

interface CharitiesData {
  charities: CharityRow[];
  mostLovedId: string | null;
}

type SortKey = 'name' | 'totalReceived' | 'userCount' | 'avgAllocation';

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

export default function AdminCharitiesPage() {
  const [data, setData] = useState<CharitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('totalReceived');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=charities')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading charities...
        </div>
      </div>
    );
  }

  if (!data || data.charities.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
        No data yet
      </div>
    );
  }

  const sorted = [...data.charities].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const chartData = sorted.slice(0, 10).map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
    value: c.totalReceived,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Charities
      </h1>

      {/* Most loved indicator */}
      {data.mostLovedId && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{
            backgroundColor: colors.red + '15',
            border: `1px solid ${colors.red}40`,
          }}
        >
          <Heart size={16} style={{ color: colors.red }} fill={colors.red} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <strong>Most loved:</strong>{' '}
            {data.charities.find((c) => c.id === data.mostLovedId)?.name ?? 'Unknown'}{' '}
            <span style={{ color: 'var(--text-secondary)' }}>
              (highest average allocation)
            </span>
          </span>
        </div>
      )}

      {/* Ranked table */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                <th
                  className="px-4 py-3 text-left font-medium w-8"
                  style={{ color: 'var(--text-dim)' }}
                >
                  #
                </th>
                {[
                  { key: 'name' as SortKey, label: 'Charity Name' },
                  { key: 'totalReceived' as SortKey, label: 'Total Received' },
                  { key: 'userCount' as SortKey, label: 'Users' },
                  { key: 'avgAllocation' as SortKey, label: 'Avg Allocation' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left font-medium cursor-pointer select-none"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} style={{ color: 'var(--text-dim)' }} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((charity, i) => (
                <tr
                  key={charity.id}
                  style={{
                    backgroundColor:
                      i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-inner)',
                  }}
                >
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-dim)' }}>
                    {i + 1}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="flex items-center gap-1.5">
                      {charity.name}
                      {charity.id === data.mostLovedId && (
                        <Heart size={12} style={{ color: colors.red }} fill={colors.red} />
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--accent-green)' }}>
                    EUR {charity.totalReceived.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {charity.userCount}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {charity.avgAllocation}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popularity bar chart */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Popularity (Top 10 by Total Received)
        </h3>
        {chartData.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                type="number"
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: colors.textSecondary, fontSize: 10 }}
                axisLine={{ stroke: colors.border }}
                tickLine={{ stroke: colors.border }}
                width={120}
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
              <Bar dataKey="value" fill={colors.green} radius={[0, 4, 4, 0]} name="EUR Received" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
