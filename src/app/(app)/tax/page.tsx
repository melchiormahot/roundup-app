"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FileText, Download, TrendingUp, Loader2, Info } from "lucide-react";
import { usePdfDownload } from "@/components/TaxPdf";

interface TaxTier {
  label: string;
  donated: number;
  saving: number;
  rate: number;
  ceiling?: number;
}

interface TaxData {
  totalTaxSaving: number;
  tiers: TaxTier[];
  effectiveCostPer10: number;
  charities: { charityName: string; charityIcon: string; donated: number; eligible: boolean }[];
  projection: { projectedTotal: number; projectedTaxSaving: number; roomToGive: number | null };
  jurisdiction: {
    code: string;
    name: string;
    currency: string;
    currencySymbol: string;
    taxLabels: { enhanced?: string; standard: string };
    receiptLabel: string;
    ceilingNote?: string;
    carryForward?: number;
  };
  user: { jurisdiction: string; incomeBracket: number; bracketLabel: string; debitFrequency: string };
}

export default function TaxPage() {
  const [data, setData] = useState<TaxData | null>(null);
  const { downloadPdf, loading: pdfLoading } = usePdfDownload();

  useEffect(() => {
    fetch("/api/tax").then((r) => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="px-5 pt-14 pb-4 max-w-lg mx-auto">
        <div className="skeleton h-6 w-40 mb-2" /><div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-32 w-full mb-4" /><div className="skeleton h-24 w-full mb-4" />
      </div>
    );
  }

  const sym = data.jurisdiction.currencySymbol;

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition overscroll-contain">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Tax Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1 font-medium">
          {data.jurisdiction.name} tax rules
        </p>
      </div>

      {/* Total Tax Saving */}
      <Card glow="blue" delay={0.1} className="mb-4 text-center">
        <p className="text-text-secondary text-sm mb-1 font-medium">Estimated tax saving</p>
        <AnimatedNumber value={data.totalTaxSaving} prefix={sym} className="text-4xl font-bold text-accent-blue" />
        <p className="text-text-secondary text-xs mt-2 font-medium">
          A {sym}10 donation costs you just {sym}{data.effectiveCostPer10} after tax
        </p>
      </Card>

      {/* Tax Tiers */}
      {data.tiers.map((tier, i) => (
        <Card key={i} delay={0.15 + i * 0.1} className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-primary font-semibold text-sm">{tier.label}</h3>
            <Badge variant={i === 0 ? "green" : "purple"}>{sym}{tier.saving.toFixed(0)} saved</Badge>
          </div>
          {/* Charities in this tier */}
          <div className="space-y-2 mb-3">
            {data.charities
              .filter((c) => {
                if (data.jurisdiction.code === "FR") {
                  return tier.rate === 75 ? c.donated > 0 : c.donated > 0;
                }
                return c.donated > 0;
              })
              .slice(0, tier.rate === 75 ? undefined : undefined)
              .map((c, j) => (
                <div key={j} className="flex items-center gap-3">
                  <span className="text-lg">{c.charityIcon}</span>
                  <div className="flex-1">
                    <p className="text-text-primary text-sm">{c.charityName}</p>
                    <p className="text-text-secondary text-xs font-medium tabular-nums">{sym}{c.donated.toFixed(2)} donated</p>
                  </div>
                  {!c.eligible && (
                    <Badge variant="yellow" className="text-xs">Not deductible</Badge>
                  )}
                </div>
              ))}
          </div>
          {tier.ceiling && (
            <ProgressBar value={tier.donated} max={tier.ceiling} color={i === 0 ? "green" : "purple"} glow label="Ceiling tracker" />
          )}
        </Card>
      ))}

      {/* Year-end Projection */}
      <Card delay={0.35} className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-accent-blue" />
          <h3 className="text-text-primary font-semibold">Year end projection</h3>
        </div>
        <p className="text-text-secondary text-sm mb-2 font-medium">
          At your current pace, you are projected to donate <span className="text-accent-green font-semibold tabular-nums">{sym}{data.projection.projectedTotal.toFixed(0)}</span> this year, saving <span className="text-accent-blue font-semibold tabular-nums">{sym}{data.projection.projectedTaxSaving.toFixed(0)}</span> in taxes.
        </p>
        {data.projection.roomToGive !== null && data.projection.roomToGive > 0 && (
          <p className="text-accent-yellow text-xs font-medium">
            You have {sym}{data.projection.roomToGive.toFixed(0)} of room under the 75% ceiling. Maximise it!
          </p>
        )}
      </Card>

      {/* Tax Info */}
      {data.jurisdiction.ceilingNote && (
        <Card delay={0.4} className="mb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
            <p className="text-text-secondary text-xs font-medium leading-relaxed">{data.jurisdiction.ceilingNote}</p>
          </div>
        </Card>
      )}

      {/* Tax Package */}
      <Card delay={0.45} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Tax Package</h3>
        <div className="space-y-3">
          {[
            { name: "Year End Summary", desc: "Total per charity, monthly breakdown", action: () => downloadPdf("summary"), key: "summary" },
            { name: "Tax Calculation", desc: "Deduction amounts by rate, ceiling tracking", action: () => downloadPdf("tax"), key: "tax" },
            { name: data.jurisdiction.receiptLabel, desc: `Official ${data.jurisdiction.name} tax receipt`, action: null, key: "receipt" },
          ].map((doc) => (
            <div key={doc.key} className="flex items-center gap-3 p-3 bg-navy-600/20 rounded-xl">
              <FileText className="w-5 h-5 text-accent-blue shrink-0" />
              <div className="flex-1">
                <p className="text-text-primary text-sm font-medium">{doc.name}</p>
                <p className="text-text-secondary text-xs font-medium">{doc.desc}</p>
              </div>
              <button
                onClick={doc.action || undefined}
                disabled={!doc.action || pdfLoading === doc.key}
                className={`p-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors ${doc.action ? "text-text-secondary hover:text-accent-blue" : "text-navy-600 cursor-not-allowed"}`}
              >
                {pdfLoading === doc.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Your Details */}
      <Card delay={0.5} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-text-secondary font-medium">Jurisdiction</span><span className="text-text-primary">{data.jurisdiction.name}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary font-medium">Income bracket</span><span className="text-text-primary">{data.user.bracketLabel}</span></div>
          <div className="flex justify-between"><span className="text-text-secondary font-medium">Debit frequency</span><span className="text-text-primary capitalize">{data.user.debitFrequency}</span></div>
        </div>
      </Card>
    </div>
  );
}
