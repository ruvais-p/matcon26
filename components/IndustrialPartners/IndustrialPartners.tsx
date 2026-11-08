import React from "react";
import Image from "next/image";
import styles from "./IndustrialPartners.module.css";

interface Partner {
  name: string;
  category: string;
  tagline: string;
  logo: string;
  website?: string;
}

const PARTNERS: Partner[] = [
  // {
  //   name: "Ants Innovations",
  //   category: "Industry Partner",
  //   tagline: "Materials | Equipment | Projects",
  //   logo: "/sponsors/Ants_Final-Logo_2-02-02.png",
  //   website: "https://antsceramics.com",
  // },
  {
    name: "Anusandhan National Research Foundation (ANRF)",
    category: "Government Partner",
    tagline: "Apex Body for Scientific Research • Govt. of India",
    logo: "/sponsors/anrf.jpg",
    website: "https://anrfonline.in",
  },
  {
    name: "Indian Oil Corporation Limited (IOCL)",
    category: "Industry Partner",
    tagline: "The Energy of India • Innovation & Technology",
    logo: "/sponsors/indianoil.jpg",
    website: "https://iocl.com",
  },
  {
    name: "Carborundum Universal Limited (CUMI)",
    category: "Industry Partner",
    tagline: "Murugappa Group • Advanced Materials",
    logo: "/sponsors/Logo-cumi.jpg",
    website: "https://www.cumi-murugappa.com",
  },
  {
    name: "Süd-Chemie",
    category: "Industry Partner",
    tagline: "Creating Performance Technology",
    logo: "/sponsors/image.png",
    website: "https://www.sud-chemie-india.com",
  },
];

export default function IndustrialPartners() {
  return (
    <section className={styles.section} id="partners" aria-label="Conference Partners">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.meta}>04/08 // COLLABORATION_&_PARTNERS</span>
          <h2 className={styles.title}>
            OUR <span className={styles.title_hi}>PARTNERS</span>
          </h2>
          <p className={styles.subtitle}>
            Proudly supported by visionary government institutions and leading industry innovators driving advancement in materials science and sustainable technologies.
          </p>
          <div className={styles.underline}></div>
        </header>

        <div className={styles.grid}>
          {PARTNERS.map((partner, index) => {
            const isGov = partner.category === "Government Partner";
            const CardContent = (
              <>
                <div className={styles.cornerTopLeft}></div>
                <div className={styles.cornerBottomRight}></div>
                
                <div className={styles.logoWrapper}>
                  <div className={styles.logoBadge}>
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={320}
                      height={120}
                      className={styles.logoImg}
                      unoptimized
                    />
                  </div>
                </div>

                <div className={styles.info}>
                  <span
                    className={`${styles.categoryBadge} ${
                      isGov ? styles.govBadge : ""
                    }`}
                  >
                    {partner.category}
                  </span>
                  <h3 className={styles.name}>{partner.name}</h3>
                  <p className={styles.tagline}>{partner.tagline}</p>
                </div>

                {partner.website && (
                  <div className={styles.linkRow}>
                    <span className={styles.visitText}>Visit Website</span>
                    <svg
                      className={styles.arrowIcon}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </div>
                )}
                <div className={styles.bottomAccent}></div>
              </>
            );

            const cardClasses = `${styles.card} ${isGov ? styles.cardGov : ""}`;

            return partner.website ? (
              <a
                key={index}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClasses}
                title={`Visit ${partner.name}`}
              >
                {CardContent}
              </a>
            ) : (
              <div key={index} className={cardClasses}>
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
