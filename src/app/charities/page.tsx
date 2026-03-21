'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Check, ChevronDown } from 'lucide-react';
import { Card, Badge, BottomNav, Toggle } from '@/components/ui';
import { CharityDetail } from '@/components/CharityDetail';
import { useAppStore } from '@/store';
import { getFeatureAccess } from '@/lib/levels';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CharityCard {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  countryCode: string | null;
  brandColor: string | null;
  taxRate?: number | null;
  loiColucheEligible?: boolean;
  qualityLabel?: string | null;
  jurisdictionsEligible?: string[];
}

interface UserCharity {
  charityId: string;
  allocationPct: number;
  totalDonated: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Health',
  'Environment',
  'Humanitarian',
  'Children',
  'Human Rights',
  'Animals',
  'Education',
];

type SortOption = 'popularity' | 'tax' | 'category' | 'alphabetical';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'tax', label: 'Tax benefit' },
  { value: 'category', label: 'Category' },
  { value: 'alphabetical', label: 'Alphabetical' },
];

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  GB: 'United Kingdom',
  DE: 'Germany',
  ES: 'Spain',
  BE: 'Belgium',
};

const COUNTRY_FLAGS: Record<string, string> = {
  FR: '\u{1F1EB}\u{1F1F7}',
  GB: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  ES: '\u{1F1EA}\u{1F1F8}',
  BE: '\u{1F1E7}\u{1F1EA}',
  INT: '\u{1F30D}',
};

// ─── Page ───────────────────────────────────────────────────────────────────

export default function CharitiesPage() {
  const router = useRouter();
  const { userId, jurisdiction, userLevel, unreadCount } = useAppStore();

  // State
  const [allCharities, setAllCharities] = useState<CharityCard[]>([]);
  const [userCharities, setUserCharities] = useState<UserCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [taxDeductibleFilter, setTaxDeductibleFilter] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  // Bottom sheet state
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const features = getFeatureAccess(userLevel);

  // ── Session check ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) {
      fetch('/api/auth/session')
        .then((r) => r.json())
        .then((data) => {
          if (!data.isLoggedIn) {
            router.push('/login');
          } else {
            useAppStore.getState().setUser({
              id: data.userId,
              name: data.name,
              level: data.userLevel ?? 1,
              jurisdiction: data.jurisdiction ?? 'FR',
              incomeBracket: data.incomeBracket ?? 0,
            });
          }
        })
        .catch(() => router.push('/login'));
    }
  }, [userId, router]);

  // ── Fetch charities ───────────────────────────────────────────────────────

  const fetchCharities = useCallback(async () => {
    if (!jurisdiction) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/charities?country=${jurisdiction}`);
      if (res.ok) {
        const data = await res.json();
        // Merge local and international into one array
        const merged = [...(data.local ?? []), ...(data.international ?? [])];
        setAllCharities(merged);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [jurisdiction]);

  const fetchUserCharities = useCallback(async () => {
    try {
      const res = await fetch('/api/charities/user');
      if (res.ok) {
        const data = await res.json();
        setUserCharities(
          (data.charities ?? []).map(
            (c: { charityId: string; allocationPct: number; totalDonated: number }) => ({
              charityId: c.charityId,
              allocationPct: c.allocationPct,
              totalDonated: c.totalDonated,
            }),
          ),
        );
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (userId && jurisdiction) {
      fetchCharities();
      fetchUserCharities();
    }
  }, [userId, jurisdiction, fetchCharities, fetchUserCharities]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const isDeductible = useCallback(
    (c: CharityCard) => {
      if (!c.jurisdictionsEligible) return false;
      return c.jurisdictionsEligible.includes(jurisdiction);
    },
    [jurisdiction],
  );

  const getEffectiveTaxRate = useCallback(
    (c: CharityCard) => {
      if (jurisdiction === 'FR' && c.loiColucheEligible) return 75;
      return c.taxRate ?? 0;
    },
    [jurisdiction],
  );

  const userCharityIds = useMemo(
    () => new Set(userCharities.map((uc) => uc.charityId)),
    [userCharities],
  );

  // Filter and sort
  const filteredCharities = useMemo(() => {
    let result = [...allCharities];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'tax':
        result.sort((a, b) => getEffectiveTaxRate(b) - getEffectiveTaxRate(a));
        break;
      case 'category':
        result.sort((a, b) =>
          (a.category ?? '').localeCompare(b.category ?? ''),
        );
        break;
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        // Default order from API (local first, then international)
        break;
    }

    // Tax deductible filter: deductible first, non-deductible last
    if (taxDeductibleFilter) {
      const deductible = result.filter((c) => isDeductible(c));
      const nonDeductible = result.filter((c) => !isDeductible(c));
      result = [...deductible, ...nonDeductible];
    }

    return result;
  }, [
    allCharities,
    searchQuery,
    selectedCategory,
    sortBy,
    taxDeductibleFilter,
    isDeductible,
    getEffectiveTaxRate,
  ]);

  // Recommended charities (deductible, best tax rate first)
  const recommendedCharities = useMemo(() => {
    return allCharities
      .filter((c) => isDeductible(c))
      .sort((a, b) => getEffectiveTaxRate(b) - getEffectiveTaxRate(a))
      .slice(0, 4);
  }, [allCharities, isDeductible, getEffectiveTaxRate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function openCharityDetail(charityId: string) {
    setSelectedCharityId(charityId);
    setDetailOpen(true);
  }

  async function handleToggleCharity(charityId: string, action: 'add' | 'remove') {
    try {
      await fetch('/api/charities/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charityId, action }),
      });
      await fetchUserCharities();
    } catch {
      // silently fail
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!userId) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
          style={{
            borderColor: 'var(--accent-purple)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-24"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* ── Header ───────────────────────────────────────────────── */}
        <h1
          className="mb-4 text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          Charities
        </h1>

        {/* ── Search bar ───────────────────────────────────────────── */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-dim)' }}
          />
          <input
            type="text"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-10 pr-4 text-sm outline-none transition-colors"
            style={{
              height: 44,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* ── Tax deductible toggle ────────────────────────────────── */}
        <div className="mb-4">
          <Toggle
            checked={taxDeductibleFilter}
            onChange={setTaxDeductibleFilter}
            label={`Tax deductible in ${COUNTRY_NAMES[jurisdiction] ?? jurisdiction}`}
          />
        </div>

        {/* ── Category filter pills ────────────────────────────────── */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="shrink-0 rounded-full px-4 text-sm font-medium transition-colors"
              style={{
                minHeight: 44,
                backgroundColor:
                  selectedCategory === cat
                    ? 'var(--accent-purple)'
                    : 'var(--bg-card-inner)',
                color:
                  selectedCategory === cat
                    ? '#ffffff'
                    : 'var(--text-secondary)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Sort options ─────────────────────────────────────────── */}
        <div className="relative mb-5">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
            }}
          >
            Sort: {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
            <ChevronDown
              size={16}
              style={{
                transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>
          {sortOpen && (
            <div
              className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl py-1 shadow-lg"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-primary)',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setSortOpen(false);
                  }}
                  className="flex w-full min-h-[44px] items-center px-4 py-2 text-sm transition-colors"
                  style={{
                    color:
                      sortBy === opt.value
                        ? 'var(--accent-purple)'
                        : 'var(--text-primary)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {opt.label}
                  {sortBy === opt.value && (
                    <Check
                      size={14}
                      className="ml-auto"
                      style={{ color: 'var(--accent-purple)' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Loading state ────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{
                borderColor: 'var(--accent-purple)',
                borderTopColor: 'transparent',
              }}
            />
          </div>
        ) : (
          <>
            {/* ── Recommended for you ─────────────────────────────── */}
            {recommendedCharities.length > 0 && !searchQuery && selectedCategory === 'All' && (
              <section className="mb-6">
                <h2
                  className="mb-1 text-base font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Recommended for you
                </h2>
                <p
                  className="mb-3 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Best tax benefits for you
                </p>
                <div className="space-y-3">
                  {recommendedCharities.map((charity) => (
                    <CharityCardItem
                      key={charity.id}
                      charity={charity}
                      jurisdiction={jurisdiction}
                      isUserCharity={userCharityIds.has(charity.id)}
                      isDeductible={isDeductible(charity)}
                      effectiveTaxRate={getEffectiveTaxRate(charity)}
                      onClick={() => openCharityDetail(charity.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* ── All charities ───────────────────────────────────── */}
            <section>
              {searchQuery || selectedCategory !== 'All' ? (
                <h2
                  className="mb-3 text-base font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {filteredCharities.length} result
                  {filteredCharities.length !== 1 ? 's' : ''}
                </h2>
              ) : (
                <h2
                  className="mb-3 text-base font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  All charities
                </h2>
              )}

              {filteredCharities.length === 0 ? (
                <div className="py-12 text-center">
                  <p
                    className="text-sm"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    No charities found matching your criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCharities.map((charity) => {
                    const deductible = isDeductible(charity);
                    const greyed =
                      taxDeductibleFilter && !deductible;

                    return (
                      <CharityCardItem
                        key={charity.id}
                        charity={charity}
                        jurisdiction={jurisdiction}
                        isUserCharity={userCharityIds.has(charity.id)}
                        isDeductible={deductible}
                        effectiveTaxRate={getEffectiveTaxRate(charity)}
                        greyed={greyed}
                        onClick={() => openCharityDetail(charity.id)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ── Charity detail bottom sheet ────────────────────────────── */}
      <CharityDetail
        charityId={selectedCharityId}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedCharityId(null);
        }}
        jurisdiction={jurisdiction}
        userLevel={userLevel}
        isUserCharity={
          selectedCharityId
            ? userCharityIds.has(selectedCharityId)
            : false
        }
        userDonated={
          selectedCharityId
            ? userCharities.find(
                (uc) => uc.charityId === selectedCharityId,
              )?.totalDonated ?? 0
            : 0
        }
        onToggleCharity={handleToggleCharity}
      />

      {/* ── Bottom nav ────────────────────────────────────────────── */}
      <BottomNav
        level={userLevel}
        unreadCount={unreadCount}
        currentPath="/charities"
      />
    </div>
  );
}

// ─── Charity Card Component ─────────────────────────────────────────────────

interface CharityCardItemProps {
  charity: CharityCard;
  jurisdiction: string;
  isUserCharity: boolean;
  isDeductible: boolean;
  effectiveTaxRate: number;
  greyed?: boolean;
  onClick: () => void;
}

const COUNTRY_FLAGS_INNER: Record<string, string> = {
  FR: '\u{1F1EB}\u{1F1F7}',
  GB: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  ES: '\u{1F1EA}\u{1F1F8}',
  BE: '\u{1F1E7}\u{1F1EA}',
  INT: '\u{1F30D}',
};

function CharityCardItem({
  charity,
  jurisdiction,
  isUserCharity,
  isDeductible: deductible,
  effectiveTaxRate,
  greyed = false,
  onClick,
}: CharityCardItemProps) {
  return (
    <Card
      onClick={onClick}
      className={greyed ? 'opacity-50' : ''}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="shrink-0 text-2xl">{charity.icon ?? '🤝'}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name row */}
          <div className="mb-1 flex items-center gap-2">
            <span
              className="truncate font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {charity.name}
            </span>
            <span className="shrink-0 text-sm">
              {COUNTRY_FLAGS_INNER[charity.countryCode ?? ''] ?? ''}
            </span>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5">
            {charity.category && (
              <Badge variant="purple">{charity.category}</Badge>
            )}

            {/* Tax rate badge */}
            {effectiveTaxRate > 0 && deductible && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--accent-yellow)',
                  color: '#121212',
                }}
              >
                {effectiveTaxRate}%{' '}
                {jurisdiction === 'FR' && effectiveTaxRate === 75
                  ? 'Loi Coluche'
                  : 'deductible'}
              </span>
            )}

            {/* Certification */}
            {charity.qualityLabel && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                style={{
                  backgroundColor: 'var(--bg-card-inner)',
                  color: 'var(--text-secondary)',
                }}
              >
                <Check size={10} />
                {charity.qualityLabel}
              </span>
            )}
          </div>

          {/* Deductibility status */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            {deductible ? (
              <>
                <Check
                  size={12}
                  style={{ color: 'var(--accent-green)' }}
                />
                <span style={{ color: 'var(--accent-green)' }}>
                  Deductible in your country
                </span>
              </>
            ) : (
              <span style={{ color: 'var(--text-dim)' }}>
                Not deductible in your country
              </span>
            )}
            {isUserCharity && (
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--accent-green)',
                  color: '#121212',
                }}
              >
                Selected
              </span>
            )}
          </div>

          {/* Greyed note */}
          {greyed && (
            <p
              className="mt-1 text-xs"
              style={{ color: 'var(--text-dim)' }}
            >
              Not tax deductible in your jurisdiction
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
