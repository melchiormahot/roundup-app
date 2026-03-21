"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { FileText, Download, TrendingUp, Loader2 } from "lucide-react";
import { usePdfDownload } from "@/components/TaxPdf";

interface TaxData {
  totalTaxSaving: number;
  rate75: {
    charities: { charityName: string; charityIcon: string; donated: number }[];
    totalDonated: number;
    taxSaving: number;
    ceiling: number;
  };
  rate66: {
    charities: { charityName: string; charityIcon: string; donated: number }[];
    totalDonated: number;
    taxSaving: number;
  };
  projection: {
    projectedTotal: number;
    projectedTaxSaving: number;
    roomToGive: number;
  };
  user: {
    jurisdiction: string;
    incomeBracket: number;
    debitFrequency: string;
  };
}

const BRACKETS = ["Under €30k", "€30k to €60k", "€60k to €100k", "€100k+"];

export default function TaxPage() {
  const [data, setData] = useState<TaxData | null>(null);
  const { downloadPdf, loading: pdfLoading } = usePdfDownload();

  useEffect(() => {
    fetch("/api/tax")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Tax Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Track your deductions in real time</p>
      </div>

      {/* Total Tax Saving */}
      <Card glow="blue" delay={0.1} className="mb-4 text-center">
        <p className="text-text-secondary text-sm mb-1">Estimated tax saving</p>
        <AnimatedNumber
          value={data.totalTaxSaving}
          prefix="€"
          className="text-4xl font-bold text-accent-blue"
        />
      </Card>

      {/* 75% Rate Card */}
      {data.rate75.charities.length > 0 && (
        <Card delay={0.2} className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-primary font-semibold">75% Rate (Loi Coluche)</h3>
            <Badge variant="green">€{data.rate75.taxSaving.toFixed(0)} saved</Badge>
          </div>
          <div className="space-y-3 mb-3">
            {data.rate75.charities.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{c.charityIcon}</span>
                <div className="flex-1">
                  <p className="text-text-primary text-sm">{c.charityName}</p>
                  <p className="text-text-secondary text-xs">€{c.donated.toFixed(2)} donated</p>
                </div>
              </div>
            ))}
          </div>
          <ProgressBar
            value={data.rate75.totalDonated}
            max={data.rate75.ceiling}
            color="green"
            glow
            label="Ceiling tracker"
          />
        </Card>
      )}

      {/* 66% Rate Card */}
      {data.rate66.charities.length > 0 && (
        <Card delay={0.3} className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-text-primary font-semibold">66% Rate (Standard)</h3>
            <Badge variant="purple">€{data.rate66.taxSaving.toFixed(0)} saved</Badge>
          </div>
          <div className="space-y-3">
            {data.rate66.charities.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-lg">{c.charityIcon}</span>
                <div className="flex-1">
                  <p className="text-text-primary text-sm">{c.charityName}</p>
                  <p className="text-text-secondary text-xs">€{c.donated.toFixed(2)} donated</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Year-end Projection */}
      <Card delay={0.4} className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-accent-blue" />
          <h3 className="text-text-primary font-semibold">Year end projection</h3>
        </div>
        <p className="text-text-secondary text-sm mb-2">
          At your current pace, you are projected to donate <span className="text-accent-green font-semibold">€{data.projection.projectedTotal.toFixed(0)}</span> this year, saving <span className="text-accent-blue font-semibold">€{data.projection.projectedTaxSaving.toFixed(0)}</span> in taxes.
        </p>
        {data.projection.roomToGive > 0 && (
          <p className="text-accent-yellow text-xs">
            You have €{data.projection.roomToGive.toFixed(0)} of room under the 75% ceiling. Maximise it!
          </p>
        )}
      </Card>

      {/* Tax Package */}
      <Card delay={0.5} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Tax Package</h3>
        <div className="space-y-3">
          {[
            { name: "Year End Summary", desc: "Total per charity, monthly breakdown", action: () => downloadPdf("summary"), key: "summary" },
            { name: "Tax Calculation", desc: "Deduction amounts by rate, ceiling tracking", action: () => downloadPdf("tax"), key: "tax" },
            { name: "CERFA 11580", desc: "Official French tax receipt (coming soon)", action: null, key: "cerfa" },
          ].map((doc) => (
            <div key={doc.key} className="flex items-center gap-3 p-3 bg-navy-800 rounded-xl">
              <FileText className="w-5 h-5 text-accent-blue shrink-0" />
              <div className="flex-1">
                <p className="text-text-primary text-sm font-medium">{doc.name}</p>
                <p className="text-text-secondary text-xs">{doc.desc}</p>
              </div>
              <button
                onClick={doc.action || undefined}
                disabled={!doc.action || pdfLoading === doc.key}
                className={`p-2 transition-colors ${doc.action ? "text-text-secondary hover:text-accent-blue" : "text-navy-600 cursor-not-allowed"}`}
              >
                {pdfLoading === doc.key ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
        <p className="text-text-secondary text-xs mt-3">
          PDFs available with sample data for demo purposes.
        </p>
      </Card>

      {/* User Settings */}
      <Card delay={0.6} className="mb-4">
        <h3 className="text-text-primary font-semibold mb-3">Your details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Jurisdiction</span>
            <span className="text-text-primary">{data.user.jurisdiction}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Income bracket</span>
            <span className="text-text-primary">{BRACKETS[data.user.incomeBracket]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Debit frequency</span>
            <span className="text-text-primary capitalize">{data.user.debitFrequency}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
