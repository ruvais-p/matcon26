import type { Metadata } from "next";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About — MATCON 2026",
  description:
    "Learn about the Department of Applied Chemistry CUSAT, MATCON 2026, the city of Kochi, and Cochin University of Science & Technology.",
};

// ── Department photos ──
const DEPT_IMAGES = [
  { src: "/about/dept-building.png", alt: "Department of Applied Chemistry building" },
  { src: "/about/dept-lobby.png",    alt: "Department lobby and corridor" },
  { src: "/about/dept-campus.jpg",   alt: "Department campus pathway" },
  { src: "/about/dept-lab.png",      alt: "Research laboratory — spectrofluorometer" },
];

const CUSAT_IMAGES = [
  { src: "/gallery/1.webp",  alt: "CUSAT Campus" },
  { src: "/gallery/2.webp",  alt: "CUSAT Campus" },
  { src: "/gallery/3.webp",  alt: "CUSAT Campus" },
  { src: "/gallery/4.webp",  alt: "CUSAT Campus" },
  { src: "/gallery/5.webp",  alt: "CUSAT Campus" },
  { src: "/gallery/6.webp",  alt: "CUSAT Campus" },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>

      {/* ══ HERO BANNER ══ */}
      <section className={styles.heroBanner}>
        <div className={styles.heroBannerInner}>
          <span className={styles.metaTag}>// ABOUT_MATCON</span>
          <h1 className={styles.heroTitle}>About</h1>
          <p className={styles.heroSub}>
            Department · Conference · City · University
          </p>
          <div className={styles.heroDivider} />
        </div>
      </section>

      <div className={styles.container}>

        {/* ══ SECTION 1 — DEPARTMENT ══ */}
        <section className={styles.section} id="department">
          <div className={styles.sectionLabel}>01 / DEPARTMENT</div>
          <div className={styles.sectionGrid}>
            <div className={styles.sectionText}>
              <h2 className={styles.sectionTitle}>
                Department of Applied Chemistry
                <span className={styles.accent}> (DAC), CUSAT</span>
              </h2>
              <p>
                Our <strong>Department of Applied Chemistry (DAC), CUSAT</strong> was
                established in <strong>1976</strong> to play an important role in
                leveraging the development of the industrial belt in the greater Cochin
                area by providing scientific support and trained personnel to the
                industries and by acting as a catalyst for the establishment of new
                industries.
              </p>
              <p>
                CUSAT is ranked as <strong>top 1 among the state</strong> and{" "}
                <strong>3rd among state universities of India</strong> (India Today
                2025), advancing to the <strong>1001–1200 band globally</strong>{" "}
                according to the Times Higher Education (THE) World University Rankings
                2026.
              </p>
              <p>
                The department has emerged as one of the <strong>best centres in
                chemistry</strong>, currently offering doctoral, post graduate,
                integrated degree programs and advanced research.
              </p>

              <div className={styles.statRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>#1</span>
                  <span className={styles.statLabel}>State University<br />(India Today 2025)</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>#3</span>
                  <span className={styles.statLabel}>Among State<br />Universities of India</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>1976</span>
                  <span className={styles.statLabel}>Year<br />Established</span>
                </div>
              </div>
            </div>

            <div className={styles.imageGrid2x2}>
              {DEPT_IMAGES.map((img) => (
                <div key={img.src} className={styles.imageCell}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ══ SECTION 2 — MATCON 2026 ══ */}
        <section className={styles.section} id="conference">
          <div className={styles.sectionLabel}>02 / THE CONFERENCE</div>
          <div className={styles.conferenceCard}>
            <div className={styles.conferenceCardAccent} />
            <div className={styles.conferenceCardBody}>
              <div className={styles.conferenceEdition}>
                <span className={styles.editionNum}>08</span>
                <span className={styles.editionSub}>th Edition</span>
              </div>
              <h2 className={styles.sectionTitle}>
                MATCON <span className={styles.accent}>2026</span>
              </h2>
              <p>
                <strong>MATCON 2026</strong> is the <strong>8th international
                conference</strong> of the prestigious MATCON series organized by the
                Department of Applied Chemistry, CUSAT. As a vital component of the
                scientific community, the conference aims at exchanging and nurturing
                innovative ideas of the latest and cutting-edge research among the
                academicians, scientists and industrialists all over the world.
              </p>
              <p>
                The <strong>3-day international conference</strong> will be devoted to
                invited lectures by eminent academicians and scientists, oral
                presentations and poster presentations by researchers and budding
                scientists from various parts of the globe.
              </p>

              <div className={styles.confHighlights}>
                <div className={styles.highlight}>
                  <span className={styles.highlightIcon}>🗓</span>
                  <span className={styles.highlightText}>15 – 17 December 2026</span>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightIcon}>📍</span>
                  <span className={styles.highlightText}>Seminar Complex, CUSAT, Kochi</span>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightIcon}>🌐</span>
                  <span className={styles.highlightText}>International Conference</span>
                </div>
                <div className={styles.highlight}>
                  <span className={styles.highlightIcon}>🎤</span>
                  <span className={styles.highlightText}>Invited Lectures · Oral · Poster</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ══ SECTION 3 — KOCHI ══ */}
        <section className={styles.section} id="kochi">
          <div className={styles.sectionLabel}>03 / THE CITY</div>
          <div className={styles.sectionGrid}>
            {/* Mosaic of Kochi images */}
            <div className={styles.kochiMosaic}>
              <div className={styles.mosaicLarge}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/gallery/7.webp" alt="Kochi waterfront" loading="lazy" />
                <div className={styles.mosaicLabel}>Kochi</div>
              </div>
              <div className={styles.mosaicSmallGrid}>
                {["/gallery/10.webp", "/gallery/12.webp", "/gallery/13.webp", "/gallery/14.webp"].map((src, i) => (
                  <div key={i} className={styles.mosaicSmall}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Kochi ${i + 1}`} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sectionText}>
              <h2 className={styles.sectionTitle}>
                Kochi <span className={styles.accent}>(Cochin)</span>
              </h2>
              <p>
                <strong>Kochi (Cochin)</strong>, the "Queen of the Arabian Sea," graces
                India's southwest coast as the vibrant commercial capital of Kerala,
                aptly known as <em>"God's Own Country."</em> Renowned as a global spice
                trading hub since the 14th century, it later emerged as one of the
                earliest European colonial settlements in India.
              </p>
              <p>
                Today, Kochi seamlessly blends rich heritage with modern growth, hosting
                premier educational and research institutions alongside thriving
                industries. The city has gained international recognition through the{" "}
                <strong>Kochi-Muziris Biennale</strong>, one of Asia's largest
                contemporary art exhibitions, attracting artists and visitors from around
                the world.
              </p>
              <p>
                Further strengthening its global outlook, Kochi is part of the{" "}
                <strong>Smart Cities Mission</strong>, focusing on sustainable urban
                development and improved quality of life. Owing to its coastal location,
                Kochi experiences a tropical climate, with December offering relatively
                mild and moderately humid conditions.
              </p>

              <div className={styles.statRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>14th</span>
                  <span className={styles.statLabel}>Century<br />Spice Hub</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>KMB</span>
                  <span className={styles.statLabel}>Asia's Largest<br />Art Biennale</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>Smart</span>
                  <span className={styles.statLabel}>Cities<br />Mission</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ══ SECTION 4 — CUSAT ══ */}
        <section className={styles.section} id="cusat">
          <div className={styles.sectionLabel}>04 / THE UNIVERSITY</div>
          <div className={styles.sectionGrid}>
            <div className={styles.sectionText}>
              <div className={styles.cusatLogoRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo/cusat_logo.png" alt="CUSAT Logo" className={styles.cusatLogo} />
                <div>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: "4px" }}>
                    Cochin University of<br />
                    <span className={styles.accent}>Science &amp; Technology</span>
                  </h2>
                  <p className={styles.cusatAbbr}>CUSAT</p>
                </div>
              </div>
              <p>
                <strong>Cochin University of Science &amp; Technology (CUSAT)</strong>{" "}
                was established in <strong>1971</strong> as the University of Cochin and
                renamed in <strong>1986</strong> to promote higher education and research
                in science and technology. The university stands as a beacon of academic
                excellence and a proud legacy in Indian higher education, emerging as a
                dynamic multidisciplinary university that nurtures leaders, innovators,
                and critical thinkers across diverse fields, empowering them to
                contribute meaningfully to science, technology, and society.
              </p>
              <p>
                With its <strong>NAAC A+ accreditation</strong>, CUSAT has received
                several recognitions including the <strong>Chancellor's Award for Best
                University in Kerala</strong> and the <strong>Chief Minister's Award
                under the Kerala Institutional Ranking Framework</strong>, and it has
                also been placed in the <strong>1001–1200 band of the Times Higher
                Education World University Rankings</strong>.
              </p>
              <p>
                Spread across three vibrant campuses, with <strong>9 faculties</strong>{" "}
                and <strong>29 departments</strong>, it thrives as a hub of research,
                discovery, and global collaboration. Guided by its timeless motto,{" "}
                <em>"Tejasvinavadhitamastu"</em> — <em>"May our learning be
                illuminated."</em>
              </p>

              <div className={styles.statRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>1971</span>
                  <span className={styles.statLabel}>Year<br />Founded</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>9</span>
                  <span className={styles.statLabel}>Faculties</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>29</span>
                  <span className={styles.statLabel}>Departments</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>A+</span>
                  <span className={styles.statLabel}>NAAC<br />Accreditation</span>
                </div>
              </div>
            </div>

            <div className={styles.cusatImageGrid}>
              {CUSAT_IMAGES.map((img, i) => (
                <div key={i} className={styles.cusatImageCell}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt={img.alt} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
