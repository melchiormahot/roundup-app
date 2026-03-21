'use client';

import { useState, useEffect, useCallback } from 'react';
import { Drawer } from 'vaul';
import { ChevronDown, ChevronUp, ExternalLink, Check, X, Minus } from 'lucide-react';
import { Badge, Button } from '@/components/ui';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MoneyHelp {
  amount: number;
  description: string;
}

interface Certification {
  name: string;
  year: number;
}

interface Milestone {
  year: number;
  title: string;
  description: string;
}

interface FinancialTransparency {
  programs_pct: number;
  admin_pct: number;
  fundraising_pct: number;
}

interface CharityFull {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  icon: string | null;
  countryCode: string | null;
  displayCountries: string[];
  qualityLabel: string | null;
  taxRate: number | null;
  loiColucheEligible: boolean;
  mission: string | null;
  foundingStory: string | null;
  impact: string[];
  howYourMoneyHelps: MoneyHelp[];
  financialTransparency: FinancialTransparency;
  certifications: Certification[];
  milestones: Milestone[];
  jurisdictionsEligible: string[];
  crossBorderMethod: string | null;
  story: string | null;
  websiteUrl: string | null;
  foundedYear: number | null;
  currency: string | null;
  brandColor: string | null;
}

interface CharityDetailProps {
  charityId: string | null;
  open: boolean;
  onClose: () => void;
  jurisdiction: string;
  userLevel: number;
  isUserCharity: boolean;
  userDonated?: number;
  onToggleCharity: (charityId: string, action: 'add' | 'remove') => void;
}

// ─── Country names ──────────────────────────────────────────────────────────

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
};

const TAX_RATES: Record<string, number> = {
  FR: 66,
  GB: 25,
  DE: 30,
  ES: 80,
  BE: 30,
};

// ─── Component ──────────────────────────────────────────────────────────────

export function CharityDetail({
  charityId,
  open,
  onClose,
  jurisdiction,
  userLevel,
  isUserCharity,
  userDonated = 0,
  onToggleCharity,
}: CharityDetailProps) {
  const [charity, setCharity] = useState<CharityFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [storyExpanded, setStoryExpanded] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allocationPct, setAllocationPct] = useState(50);

  const fetchCharity = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/charities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCharity(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (charityId && open) {
      fetchCharity(charityId);
    } else {
      setCharity(null);
    }
  }, [charityId, open, fetchCharity]);

  function handleToggle() {
    if (!charity) return;
    setSaving(true);
    onToggleCharity(charity.id, isUserCharity ? 'remove' : 'add');
    setTimeout(() => setSaving(false), 600);
  }

  // Jurisdiction display helpers
  const DISPLAY_COUNTRIES = ['FR', 'GB', 'DE', 'ES', 'BE'];

  function getDeductibilityStatus(countryCode: string) {
    if (!charity) return { status: 'unavailable' as const, rate: 0 };
    const isEligible = charity.jurisdictionsEligible.includes(countryCode);
    if (isEligible) {
      const rate =
        countryCode === 'FR' && charity.loiColucheEligible
          ? 75
          : TAX_RATES[countryCode] ?? 0;
      return { status: 'deductible' as const, rate };
    }
    if (charity.crossBorderMethod) {
      return { status: 'cross_border' as const, rate: 0 };
    }
    return { status: 'unavailable' as const, rate: 0 };
  }

  // Impact calculator
  function getImpactEstimate() {
    if (!charity || userDonated <= 0 || charity.howYourMoneyHelps.length === 0)
      return null;
    // Use the lowest tier as the unit
    const lowest = charity.howYourMoneyHelps[0];
    if (!lowest || lowest.amount <= 0) return null;
    const count = Math.floor(userDonated / lowest.amount);
    if (count <= 0) return null;
    return { count, description: lowest.description, unitCost: lowest.amount };
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      snapPoints={[0.4, 0.65, 0.92]}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        />
        <Drawer.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl outline-none"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border-primary)',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div
              className="h-1.5 w-10 rounded-full"
              style={{ backgroundColor: 'var(--border-secondary)' }}
            />
          </div>

          <Drawer.Title className="sr-only">
            {charity?.name ?? 'Charity details'}
          </Drawer.Title>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }}
              />
            </div>
          ) : charity ? (
            <div
              className="flex-1 overflow-y-auto px-4 pb-32"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* ── Brand color gradient header ─────────────────────────── */}
              <div
                className="absolute inset-x-0 top-0 h-32 rounded-t-2xl"
                style={{
                  background: charity.brandColor
                    ? `linear-gradient(180deg, ${charity.brandColor}18 0%, transparent 100%)`
                    : 'transparent',
                  pointerEvents: 'none',
                }}
              />

              {/* ── Header ──────────────────────────────────────────────── */}
              <div className="relative mb-6">
                <div className="mb-3 text-4xl">{charity.icon ?? '🤝'}</div>
                <h2
                  className="mb-2 text-xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {charity.name}
                </h2>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {charity.category && (
                    <Badge variant="purple">{charity.category}</Badge>
                  )}
                  {charity.foundedYear && (
                    <Badge variant="blue">Founded {charity.foundedYear}</Badge>
                  )}
                </div>
                {charity.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {charity.certifications.map((cert) => (
                      <span
                        key={cert.name}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--bg-card-inner)',
                          color: 'var(--accent-yellow)',
                        }}
                      >
                        <Check size={12} /> {cert.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Mission ─────────────────────────────────────────────── */}
              {charity.mission && (
                <section className="mb-6">
                  <h3
                    className="mb-2 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Our mission
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {charity.mission}
                  </p>
                </section>
              )}

              {/* ── Our story (founding) ────────────────────────────────── */}
              {charity.foundingStory && (
                <section className="mb-6">
                  <button
                    onClick={() => setStoryExpanded(!storyExpanded)}
                    className="flex w-full min-h-[44px] items-center justify-between"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide">
                      Our story
                    </h3>
                    {storyExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                  {storyExpanded && (
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {charity.foundingStory}
                    </p>
                  )}
                </section>
              )}

              {/* ── Impact bullets ──────────────────────────────────────── */}
              {charity.impact.length > 0 && (
                <section className="mb-6">
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Impact
                  </h3>
                  <ul className="space-y-2">
                    {charity.impact.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: 'var(--accent-green)' }}
                        />
                        <span style={{ color: 'var(--text-primary)' }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* ── How your money helps ────────────────────────────────── */}
              {charity.howYourMoneyHelps.length > 0 && (
                <section className="mb-6">
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    How your money helps
                  </h3>
                  <div className="relative ml-4 border-l-2" style={{ borderColor: 'var(--border-primary)' }}>
                    {charity.howYourMoneyHelps.map((tier, i) => (
                      <div key={i} className="relative mb-4 pl-6 last:mb-0">
                        {/* Dot on line */}
                        <span
                          className="absolute -left-[7px] top-1 h-3 w-3 rounded-full"
                          style={{ backgroundColor: 'var(--accent-purple)' }}
                        />
                        <div
                          className="rounded-2xl p-4"
                          style={{
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          <span
                            className="mb-1 block text-lg font-bold tabular-nums"
                            style={{ color: 'var(--accent-green)' }}
                          >
                            {charity.currency === 'GBP' ? '\u00A3' : '\u20AC'}
                            {tier.amount}
                          </span>
                          <span
                            className="text-sm leading-relaxed"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {tier.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Financial transparency bar ─────────────────────────── */}
              {charity.financialTransparency.programs_pct > 0 && (
                <section className="mb-6">
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Financial transparency
                  </h3>
                  <div
                    className="mb-2 overflow-hidden rounded-full"
                    style={{ height: 12 }}
                  >
                    <div className="flex h-full">
                      <div
                        style={{
                          width: `${charity.financialTransparency.programs_pct}%`,
                          backgroundColor: 'var(--accent-green)',
                        }}
                      />
                      <div
                        style={{
                          width: `${charity.financialTransparency.admin_pct}%`,
                          backgroundColor: 'var(--accent-blue)',
                        }}
                      />
                      <div
                        style={{
                          width: `${charity.financialTransparency.fundraising_pct}%`,
                          backgroundColor: 'var(--accent-orange)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent-green)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Programs{' '}
                        {charity.financialTransparency.programs_pct}%
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent-blue)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Admin {charity.financialTransparency.admin_pct}%
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent-orange)' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Fundraising{' '}
                        {charity.financialTransparency.fundraising_pct}%
                      </span>
                    </span>
                  </div>
                  <p
                    className="mt-2 text-sm font-medium"
                    style={{ color: 'var(--accent-green)' }}
                  >
                    {charity.financialTransparency.programs_pct}% goes directly
                    to programs
                  </p>
                </section>
              )}

              {/* ── Your impact so far ─────────────────────────────────── */}
              {(() => {
                const impact = getImpactEstimate();
                if (!impact) return null;
                return (
                  <section className="mb-6">
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-primary)',
                      }}
                    >
                      <h3
                        className="mb-2 text-sm font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Your impact so far
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Your{' '}
                        <span
                          className="font-bold"
                          style={{ color: 'var(--accent-green)' }}
                        >
                          {charity.currency === 'GBP' ? '\u00A3' : '\u20AC'}
                          {userDonated.toFixed(2)}
                        </span>{' '}
                        has funded approximately{' '}
                        <span
                          className="font-bold"
                          style={{ color: 'var(--accent-purple)' }}
                        >
                          {impact.count}
                        </span>{' '}
                        times: {impact.description}
                      </p>
                    </div>
                  </section>
                );
              })()}

              {/* ── Achievement timeline ────────────────────────────────── */}
              {charity.milestones.length > 0 && (
                <section className="mb-6">
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Milestones
                  </h3>
                  {/* Vertical on mobile, horizontal on desktop */}
                  {/* Mobile: vertical timeline */}
                  <div className="block md:hidden">
                    <div className="relative ml-4 border-l-2" style={{ borderColor: 'var(--border-primary)' }}>
                      {charity.milestones.map((m, i) => (
                        <div key={i} className="relative mb-5 pl-6 last:mb-0">
                          <span
                            className="absolute -left-[7px] top-0.5 h-3 w-3 rounded-full"
                            style={{ backgroundColor: 'var(--accent-purple)' }}
                          />
                          <span
                            className="mb-0.5 block text-xs font-bold tabular-nums"
                            style={{ color: 'var(--accent-yellow)' }}
                          >
                            {m.year}
                          </span>
                          <span
                            className="mb-0.5 block text-sm font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {m.title}
                          </span>
                          <span
                            className="block text-xs leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {m.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Desktop: horizontal timeline */}
                  <div className="hidden md:block">
                    <div className="flex items-start gap-4 overflow-x-auto pb-2">
                      {charity.milestones.map((m, i) => (
                        <div
                          key={i}
                          className="flex min-w-[160px] flex-col items-center text-center"
                        >
                          <span
                            className="mb-1 text-xs font-bold tabular-nums"
                            style={{ color: 'var(--accent-yellow)' }}
                          >
                            {m.year}
                          </span>
                          <span
                            className="mb-2 h-3 w-3 rounded-full"
                            style={{ backgroundColor: 'var(--accent-purple)' }}
                          />
                          {i < charity.milestones.length - 1 && (
                            <div
                              className="absolute h-0.5 w-full"
                              style={{ backgroundColor: 'var(--border-primary)' }}
                            />
                          )}
                          <span
                            className="mb-0.5 text-sm font-semibold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {m.title}
                          </span>
                          <span
                            className="text-xs leading-relaxed"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {m.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ── Tax deductibility ──────────────────────────────────── */}
              <section className="mb-6">
                <h3
                  className="mb-3 text-sm font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Tax deductibility
                </h3>
                <div className="space-y-2">
                  {DISPLAY_COUNTRIES.map((cc) => {
                    const { status, rate } = getDeductibilityStatus(cc);
                    const isUser = cc === jurisdiction;

                    return (
                      <div
                        key={cc}
                        className="flex items-center justify-between rounded-xl px-3 py-2"
                        style={{
                          backgroundColor: isUser
                            ? 'var(--bg-card)'
                            : 'transparent',
                          border: isUser
                            ? '1px solid var(--accent-purple)'
                            : '1px solid transparent',
                        }}
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <span>{COUNTRY_FLAGS[cc] ?? ''}</span>
                          <span
                            style={{
                              color: isUser
                                ? 'var(--text-primary)'
                                : 'var(--text-secondary)',
                              fontWeight: isUser ? 600 : 400,
                            }}
                          >
                            {COUNTRY_NAMES[cc] ?? cc}
                            {isUser && ' (you)'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          {status === 'deductible' && (
                            <>
                              <Check
                                size={14}
                                style={{ color: 'var(--accent-green)' }}
                              />
                              <span style={{ color: 'var(--accent-green)' }}>
                                Deductible at {rate}%
                              </span>
                            </>
                          )}
                          {status === 'cross_border' && (
                            <>
                              <Minus
                                size={14}
                                style={{ color: 'var(--accent-orange)' }}
                              />
                              <span style={{ color: 'var(--accent-orange)' }}>
                                Via TGE
                              </span>
                            </>
                          )}
                          {status === 'unavailable' && (
                            <>
                              <X
                                size={14}
                                style={{ color: 'var(--text-dim)' }}
                              />
                              <span style={{ color: 'var(--text-dim)' }}>
                                Not available
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── Identifiable victim story ──────────────────────────── */}
              {charity.story && (
                <section className="mb-6">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: 'var(--bg-card-inner)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          color: 'var(--text-dim)',
                        }}
                      >
                        {charity.icon ?? '👤'}
                      </div>
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        A real story
                      </span>
                    </div>
                    <blockquote
                      className="text-sm italic leading-relaxed"
                      style={{
                        color: 'var(--text-primary)',
                        borderLeft: '3px solid var(--accent-purple)',
                        paddingLeft: '12px',
                      }}
                    >
                      {charity.story}
                    </blockquote>
                  </div>
                </section>
              )}

              {/* ── Allocation slider (Level 2+) ──────────────────────── */}
              {userLevel >= 2 && isUserCharity && (
                <section className="mb-6">
                  <h3
                    className="mb-3 text-sm font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Allocation
                  </h3>
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        Current allocation
                      </span>
                      <span
                        className="text-lg font-bold tabular-nums"
                        style={{ color: 'var(--accent-purple)' }}
                      >
                        {allocationPct}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={allocationPct}
                      onChange={(e) =>
                        setAllocationPct(Number(e.target.value))
                      }
                      className="w-full accent-[var(--accent-purple)]"
                      style={{
                        height: 44,
                      }}
                    />
                    <Button
                      variant="primary"
                      size="md"
                      className="mt-3 w-full"
                      onClick={async () => {
                        setSaving(true);
                        try {
                          await fetch('/api/charities/user', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              allocations: [
                                {
                                  charityId: charity.id,
                                  pct: allocationPct,
                                },
                              ],
                            }),
                          });
                        } catch {
                          // silently fail
                        } finally {
                          setSaving(false);
                        }
                      }}
                      loading={saving}
                    >
                      Save allocation
                    </Button>
                  </div>
                </section>
              )}

              {/* ── Website link ────────────────────────────────────────── */}
              {charity.websiteUrl && (
                <section className="mb-6">
                  <a
                    href={charity.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-card-inner)',
                      color: 'var(--accent-blue)',
                    }}
                  >
                    Visit website
                    <ExternalLink size={14} />
                  </a>
                </section>
              )}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center py-20">
              <p style={{ color: 'var(--text-dim)' }}>Charity not found</p>
            </div>
          )}

          {/* ── Fixed bottom action button ───────────────────────────── */}
          {charity && !loading && (
            <div
              className="absolute inset-x-0 bottom-0 border-t p-4 safe-bottom"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-primary)',
              }}
            >
              <Button
                variant={isUserCharity ? 'secondary' : 'primary'}
                size="lg"
                className="w-full"
                onClick={handleToggle}
                loading={saving}
              >
                {isUserCharity
                  ? 'Remove from my charities'
                  : 'Add to my charities'}
              </Button>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
