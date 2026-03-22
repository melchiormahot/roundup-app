'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Search, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  jurisdiction: string | null;
  user_level: number | null;
  income_bracket: number | null;
  totalDonated: number;
  created_at: string | null;
}

interface UsersData {
  users: UserRow[];
  jurisdictionDistribution: { name: string; value: number }[];
  incomeBracketDistribution: { name: string; value: number }[];
}

type SortKey = 'name' | 'email' | 'jurisdiction' | 'user_level' | 'totalDonated' | 'created_at';

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

const PIE_COLORS_KEYS: (keyof ReturnType<typeof useChartColors>)[] = [
  'green',
  'blue',
  'purple',
  'yellow',
  'orange',
];

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=users')
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
      setSortDir('asc');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading users...
        </div>
      </div>
    );
  }

  if (!data || data.users.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
        No data yet
      </div>
    );
  }

  const filtered = data.users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortKey) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'email':
        aVal = a.email.toLowerCase();
        bVal = b.email.toLowerCase();
        break;
      case 'jurisdiction':
        aVal = a.jurisdiction ?? '';
        bVal = b.jurisdiction ?? '';
        break;
      case 'user_level':
        aVal = a.user_level ?? 0;
        bVal = b.user_level ?? 0;
        break;
      case 'totalDonated':
        aVal = a.totalDonated;
        bVal = b.totalDonated;
        break;
      case 'created_at':
        aVal = a.created_at ?? '';
        bVal = b.created_at ?? '';
        break;
    }

    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const pieColors = PIE_COLORS_KEYS.map((k) => colors[k]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Users
      </h1>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--text-dim)' }}
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                {[
                  { key: 'name' as SortKey, label: 'Name' },
                  { key: 'email' as SortKey, label: 'Email' },
                  { key: 'jurisdiction' as SortKey, label: 'Jurisdiction' },
                  { key: 'user_level' as SortKey, label: 'Level' },
                  { key: 'totalDonated' as SortKey, label: 'Total Donated' },
                  { key: 'created_at' as SortKey, label: 'Joined' },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 text-left font-medium cursor-pointer select-none whitespace-nowrap"
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
              {sorted.map((user, i) => (
                <>
                  <tr
                    key={user.id}
                    onClick={() =>
                      setExpandedId(expandedId === user.id ? null : user.id)
                    }
                    className="cursor-pointer transition-colors"
                    style={{
                      backgroundColor:
                        i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-card-inner)',
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span className="flex items-center gap-1">
                        {user.name}
                        {expandedId === user.id ? (
                          <ChevronUp size={14} style={{ color: 'var(--text-dim)' }} />
                        ) : (
                          <ChevronDown size={14} style={{ color: 'var(--text-dim)' }} />
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {user.email}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {user.jurisdiction ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--accent-purple)',
                          color: 'var(--bg-primary)',
                        }}
                      >
                        L{user.user_level ?? 1}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 tabular-nums"
                      style={{ color: 'var(--accent-green)' }}
                    >
                      EUR {user.totalDonated.toFixed(2)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-dim)' }}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                  {expandedId === user.id && (
                    <tr
                      key={`${user.id}-detail`}
                      style={{ backgroundColor: 'var(--bg-card-inner)' }}
                    >
                      <td colSpan={6} className="px-4 py-3">
                        <div
                          className="text-xs space-y-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          <p>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              Income Bracket:
                            </strong>{' '}
                            {['<25k', '25k-50k', '50k-100k', '>100k'][
                              user.income_bracket ?? 0
                            ] ?? '-'}
                          </p>
                          <p>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              User ID:
                            </strong>{' '}
                            {user.id}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length === 0 && (
        <div
          className="text-center py-8 text-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          No users match your search.
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Jurisdiction Pie */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Jurisdiction Distribution
          </h3>
          {data.jurisdictionDistribution.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.jurisdictionDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {data.jurisdictionDistribution.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={pieColors[idx % pieColors.length]}
                    />
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

        {/* Income Bracket Bar */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            Income Bracket Distribution
          </h3>
          {data.incomeBracketDistribution.length === 0 ? (
            <div className="text-xs py-8 text-center" style={{ color: 'var(--text-dim)' }}>
              No data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.incomeBracketDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={colors.border}
                />
                <XAxis
                  dataKey="name"
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
                <Bar dataKey="value" fill={colors.blue} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
