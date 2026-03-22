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
  Legend,
} from 'recharts';
import { AlertTriangle, FileDown } from 'lucide-react';

interface TaxData {
  byJurisdiction: {
    jurisdiction: string;
    totalDonated: number;
    estimatedSavings: number;
    userCount: number;
  }[];
  byBracket: {
    bracket: string;
    totalDonated: number;
    userCount: number;
  }[];
  approachingCeiling: number;
  pdfDownloads: number;
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

export default function AdminTaxPage() {
  const [data, setData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=tax')
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
          Loading tax analytics...
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

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Tax Analytics
      </h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} style={{ color: colors.yellow }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Users Approaching Ceiling
            </span>
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {data.approachingCeiling}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="flex items-center gap-2 mb-1">
            <FileDown size={16} style={{ color: colors.blue }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              PDF Downloads
            </span>
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {data.pdfDownloads}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
            Placeholder
          </div>
        </div>
      </div>

      {/* Savings by jurisdiction */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Savings by Jurisdiction
        </h3>
        {data.byJurisdiction.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.byJurisdiction}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="jurisdiction"
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
              <Bar
                dataKey="totalDonated"
                fill={colors.blue}
                name="Total Donated"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="estimatedSavings"
                fill={colors.green}
                name="Estimated Savings"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Savings by income bracket */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Donations by Income Bracket
        </h3>
        {data.byBracket.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.byBracket}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis
                dataKey="bracket"
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
              <Bar dataKey="totalDonated" fill={colors.purple} name="Total Donated" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
