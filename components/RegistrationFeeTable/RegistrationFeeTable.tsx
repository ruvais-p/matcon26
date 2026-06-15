"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./RegistrationFeeTable.module.css";

const FEE_ROWS = [
  { cat: "Students",          vals: [3000, 3500, 4000, 4500, 5000] },
  { cat: "Research Scholars", vals: [3500, 4000, 4500, 5000, 5500] },
  { cat: "Faculty",           vals: [6000, 7000, 7000, 8000, 8000] },
  { cat: "Industry",          vals: [12000, 15000, 13000, 16000, 14000] },
  { cat: "Foreign Students",  vals: [250, 300, 350, 400, 450], usd: true },
  { cat: "Foreign Scholars",  vals: [350, 400, 450, 500, 550], usd: true },
  { cat: "Foreign Faculty",   vals: [500, 600, 600, 700, 700], usd: true },
] as const;

export default function RegistrationFeeTable() {
  const [isScrollable, setIsScrollable] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const onScroll = () => setHasScrolled(true);
    el.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className={styles.section} aria-labelledby="fee-table-heading">
      {/* ── Section Header ── */}
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIndex}>// FEE_SCHEDULE</span>
        <h2 className={styles.sectionTitle} id="fee-table-heading">
          Registration Fee
        </h2>
        <div className={styles.sectionLine} />
      </div>

      {/* ── Swipe hint (mobile) ── */}
      {isScrollable && !hasScrolled && (
        <div className={styles.swipeHint} aria-hidden="true">
          <span className={styles.swipeHintArrow}>&#8592; &#8594;</span>
          <span>Swipe to see more</span>
        </div>
      )}

      {/* ── Table ── */}
      <div ref={tableRef} className={styles.feeTableWrap}>
        <table className={styles.feeTable}>
          <thead>
            <tr>
              <th className={styles.feeThCategory} rowSpan={2}>Category</th>
              <th className={styles.feeTh} colSpan={2}>Early Bird Registration</th>
              <th className={styles.feeTh} colSpan={2}>Late Registration</th>
              <th className={styles.feeTh}>Spot Registration</th>
            </tr>
            <tr>
              <th className={styles.feeThSub}>Participation</th>
              <th className={styles.feeThSub}>Oral / Poster</th>
              <th className={styles.feeThSub}>Participation</th>
              <th className={styles.feeThSub}>Oral / Poster</th>
              <th className={styles.feeThSub}>Participation</th>
            </tr>
          </thead>
          <tbody>
            {FEE_ROWS.map(({ cat, vals, usd }) => (
              <tr key={cat} className={styles.feeTr}>
                <td className={styles.feeTdCat}>{cat}</td>
                {vals.map((v, i) => (
                  <td key={i} className={styles.feeTd}>
                    {usd ? `$${v}` : `₹${v.toLocaleString("en-IN")}`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Deadlines ── */}
      <div className={styles.feeDeadlines}>
        <span className={styles.feeDeadline}>
          Early Bird deadline: <strong>July 25</strong>
        </span>
        <span className={styles.feeDeadlineSep}>|</span>
        <span className={styles.feeDeadline}>
          Late Registration deadline: <strong>October 25</strong>
        </span>
      </div>
      <p className={styles.feeNote}>* All fees are excluding GST.</p>

      {/* ── Register CTA ── */}
      <div className={styles.registerRow}>
        <a
          href="https://onlinesbi.sbi.bank.in/sbicollect/icollecthome.htm?corpID=7053967"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.registerBtn}
        >
          <span>Register Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </section>
  );
}
