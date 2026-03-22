'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does round up work?',
    answer:
      'Every time you make a purchase with your linked card, we round up the amount to the nearest euro. For example, a \u20AC4.30 coffee becomes \u20AC5.00, and the \u20AC0.70 difference goes to the charities you choose. You stay in full control and can pause or adjust at any time.',
  },
  {
    question: 'Which charities can I support?',
    answer:
      'We partner with over 45 verified charities across France, the UK, Germany, Belgium, and Spain. From humanitarian aid organizations like M\u00E9decins Sans Fronti\u00E8res to environmental groups like WWF, you can split your donations across multiple causes that matter to you.',
  },
  {
    question: 'How much does it cost me?',
    answer:
      'RoundUp is completely free to use. There are no subscription fees, no hidden charges, and no commissions on your donations. 100% of your round ups go directly to the charities you select.',
  },
  {
    question: 'How do tax deductions work?',
    answer:
      'In France, donations to qualifying charities are eligible for a 75% tax credit on the first \u20AC2,000 donated under the Loi Coluche. This means if you donate \u20AC180 in a year, you could get \u20AC135 back on your taxes. We generate your official tax certificates automatically.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use bank level encryption and never store your card details. All transactions are processed through secure, PCI compliant payment infrastructure. Your financial data is protected with the same standards used by leading European banks.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, you can pause or cancel your round ups at any moment from your dashboard. There are no lock in periods, no cancellation fees, and no questions asked. You remain in complete control of your giving.',
  },
  {
    question: 'Which countries are supported?',
    answer:
      'RoundUp currently supports users in France, the United Kingdom, Germany, Belgium, and Spain. Each country has its own set of tax optimized charities and accurate deduction calculations based on local tax law.',
  },
  {
    question: 'How do I get my tax documents?',
    answer:
      'At the end of each fiscal year, we automatically generate your official tax certificates (cerfa in France) that you can download as PDF from your dashboard. You can also access a running summary of your donations and projected deductions at any time.',
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.4,
          }}
        >
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ flexShrink: 0 }}
        >
          <ChevronDown size={20} color="var(--text-dim)" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                paddingBottom: '24px',
                maxWidth: '640px',
              }}
            >
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      style={{
        padding: '120px 24px',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '64px' }}
      >
        <p
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--accent-orange)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}
        >
          FAQ
        </p>
        <h2
          style={{
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
          }}
        >
          Questions and answers
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        {faqs.map((faq, i) => (
          <FAQItem
            key={i}
            faq={faq}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.div>
    </section>
  );
}
