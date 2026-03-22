'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';

interface DonationsData {
  dailyDonations: { day: string; total: number; count: number }[];
  charityDonations: { name: string; total: number }[];
  byTaxRate: { name: string; value: number }[];
  histogram: { label: string; count: number }[];
  topDonors: {
    name: string;
    total: number;
    roundupCount: number;
    charityCount: number;
  }[];
}

type DonorSortKey = 'name' | 'total' | 'roundupCount' | 'charityCount';

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

export default function AdminDonationsPage() {
  const [data, setData] = useState<DonationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [donorSortKey, setDonorSortKey] = useState<DonorSortKey>('total');
  const [donorSortDir, setDonorSortDir] = useState<'asc' | 'desc'>('desc');
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=donations')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleDonorSort(key: DonorSortKey) {
    if (donorSortKey === key) {
      setDonorSortDir(donorSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setDonorSortKey(key);
      setDonorSortDir('desc');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading donations...
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

  const pieColors = [colors.green, colors.blue, colors.purple, colors.yellow, colors.orange];

  const sortedDonors = [...data.topDonors].sort((a, b) => {
    const aVal = a[donorSortKey];
    const bVal = b[donorSortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return donorSortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return donorSortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Donations
      </h1>

      {/* Daily donations line chart */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Daily Donation Totals (Last 30 Days)
        </h3>
        {data.dailyDonations.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.dailyDonations}>
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
                dataKey="total"
                stroke={colors.green}
                strokeWidth={2}
                dot={{ fill: colors.green, r: 3 }}
                name="EUR Total"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donations per charity bar chart */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            Donations per Charity
          </h3>
          {data.charityDonations.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.charityDonations} layout="vertical">
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
                  width={100}
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
                <Bar dataKey="total" fill={colors.blue} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* By tax rate pie chart */}
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            By Tax Rate
          </h3>
          {data.byTaxRate.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.byTaxRate}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.byTaxRate.map((_, idx) => (
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
      </div>

      {/* Histogram */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Donation Size Distribution
        </h3>
        {data.histogram.every((b) => b.count === 0) ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.histogram}>
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
              <Bar dataKey="count" fill={colors.purple} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top donors table */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Top Donors
        </h3>
        {data.topDonors.length === 0 ? (
          <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
            No data yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-card-inner)' }}>
                  {[
                    { key: 'name' as DonorSortKey, label: 'Name' },
                    { key: 'total' as DonorSortKey, label: 'Total Donated' },
                    { key: 'roundupCount' as DonorSortKey, label: 'Roundups' },
                    { key: 'charityCount' as DonorSortKey, label: 'Charities' },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleDonorSort(col.key)}
                      className="px-4 py-2 text-left font-medium cursor-pointer select-none"
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
                {sortedDonors.map((donor, i) => (
                  <tr
                    key={i}
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-inner)',
                    }}
                  >
                    <td className="px-4 py-2" style={{ color: 'var(--text-primary)' }}>
                      {donor.name}
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'var(--accent-green)' }}>
                      EUR {donor.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {donor.roundupCount}
                    </td>
                    <td className="px-4 py-2 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {donor.charityCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
