'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Download, ArrowUpDown } from 'lucide-react';
import { downloadCSV } from '@/lib/csv';

interface Signup {
  id: string;
  email: string | null;
  country: string | null;
  createdAt: string | null;
}

interface EarlyAccessData {
  signups: Signup[];
  byCountry: { name: string; value: number }[];
  totalSignups: number;
  converted: number;
  conversionRate: number;
}

type SortKey = 'email' | 'country' | 'createdAt';

function useChartColors() {
  const [colors, setColors] = useState({
    green: '#86efac',
    blue: '#60a5fa',
    purple: '#c084fc',
    yellow: '#fbbf24',
    orange: '#fb923c',
  });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    setColors({
      green: style.getPropertyValue('--accent-green').trim() || '#86efac',
      blue: style.getPropertyValue('--accent-blue').trim() || '#60a5fa',
      purple: style.getPropertyValue('--accent-purple').trim() || '#c084fc',
      yellow: style.getPropertyValue('--accent-yellow').trim() || '#fbbf24',
      orange: style.getPropertyValue('--accent-orange').trim() || '#fb923c',
    });
  }, []);

  return colors;
}

export default function AdminEarlyAccessPage() {
  const [data, setData] = useState<EarlyAccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=early-access')
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

  function handleExportCSV() {
    if (!data) return;
    const rows = data.signups.map((s) => ({
      email: s.email ?? '',
      country: s.country ?? '',
      date: s.createdAt ?? '',
    }));
    downloadCSV(rows, 'early-access-signups.csv');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading early access data...
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

  const sorted = [...data.signups].sort((a, b) => {
    const aVal = a[sortKey] ?? '';
    const bVal = b[sortKey] ?? '';
    return sortDir === 'asc'
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const pieColors = [colors.green, colors.blue, colors.purple, colors.yellow, colors.orange];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Early Access
        </h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* KPIs */}
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
            {data.converted}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Converted to Users
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Signups by country pie */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Signups by Country
          </h3>
          {data.byCountry.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byCountry}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.byCountry.map((_, idx) => (
                    <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card-inner)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Signups table */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Recent Signups
          </h3>
          {data.signups.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <tr>
                    {[
                      { key: 'email' as SortKey, label: 'Email' },
                      { key: 'country' as SortKey, label: 'Country' },
                      { key: 'createdAt' as SortKey, label: 'Date' },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-3 py-2 text-left font-medium cursor-pointer select-none text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <ArrowUpDown size={10} style={{ color: 'var(--text-dim)' }} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 50).map((signup, i) => (
                    <tr
                      key={signup.id}
                      style={{
                        backgroundColor:
                          i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-inner)',
                      }}
                    >
                      <td className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-primary)' }}>
                        {signup.email}
                      </td>
                      <td className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {signup.country ?? '-'}
                      </td>
                      <td className="px-3 py-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
                        {signup.createdAt
                          ? new Date(signup.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
