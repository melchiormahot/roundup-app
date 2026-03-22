'use client';

import { useEffect, useState, useRef } from 'react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  Euro,
  TrendingUp,
  CheckCircle,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

interface OverviewData {
  totalUsers: number;
  totalDonated: number;
  avgDonation: number;
  onboardingPct: number;
  activeUsers7d: number;
  sparklines: {
    donations: { day: string; value: number }[];
    users: { day: string; value: number }[];
  };
}

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

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    }

    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const formatted = Number.isInteger(value)
    ? Math.round(display).toLocaleString()
    : display.toFixed(2);

  return (
    <span className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  );
}

function KPICard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  color,
  sparkline,
  sparkColor,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  color: string;
  sparkline?: { day: string; value: number }[];
  sparkColor?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = `${prefix ?? ''}${value}${suffix ?? ''}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2 relative group cursor-pointer"
      style={{ backgroundColor: 'var(--bg-card)' }}
      onClick={handleCopy}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon size={16} style={{ color }} />
        </div>
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
          style={{ color: 'var(--text-dim)' }}
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div
        className="text-2xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="h-8 mt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor ?? color}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snapshotCopied, setSnapshotCopied] = useState(false);
  const colors = useChartColors();

  useEffect(() => {
    fetch('/api/admin?view=overview')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function exportSnapshot() {
    if (!data) return;
    const text = [
      `RoundUp Admin Snapshot`,
      `──────────────────────`,
      `Total Users: ${data.totalUsers}`,
      `Total Donated: EUR ${data.totalDonated.toFixed(2)}`,
      `Avg Donation: EUR ${data.avgDonation.toFixed(2)}`,
      `Onboarding Completion: ${data.onboardingPct}%`,
      `Active Users (7d): ${data.activeUsers7d}`,
      `──────────────────────`,
      `Exported: ${new Date().toISOString()}`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setSnapshotCopied(true);
      setTimeout(() => setSnapshotCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-pulse"
          style={{ color: 'var(--text-secondary)' }}
        >
          Loading overview...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="text-center py-12"
        style={{ color: 'var(--text-secondary)' }}
      >
        No data yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Overview
        </h1>
        <button
          onClick={exportSnapshot}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{
            backgroundColor: snapshotCopied
              ? 'var(--accent-green)'
              : 'var(--bg-card)',
            color: snapshotCopied
              ? 'var(--bg-primary)'
              : 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {snapshotCopied ? 'Copied!' : 'Export Snapshot'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KPICard
          label="Total Users"
          value={data.totalUsers}
          icon={Users}
          color={colors.blue}
          sparkline={data.sparklines.users}
          sparkColor={colors.blue}
        />
        <KPICard
          label="Total Donated"
          value={data.totalDonated}
          prefix="EUR "
          icon={Euro}
          color={colors.green}
          sparkline={data.sparklines.donations}
          sparkColor={colors.green}
        />
        <KPICard
          label="Avg Donation"
          value={data.avgDonation}
          prefix="EUR "
          icon={TrendingUp}
          color={colors.purple}
        />
        <KPICard
          label="Onboarding %"
          value={data.onboardingPct}
          suffix="%"
          icon={CheckCircle}
          color={colors.yellow}
        />
        <KPICard
          label="Active Users (7d)"
          value={data.activeUsers7d}
          icon={Activity}
          color={colors.orange}
        />
      </div>
    </div>
  );
}
