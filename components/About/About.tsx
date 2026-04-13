import styles from "./About.module.css";

const THEMES = [
  "Green and Sustainable Chemistry",
  "Smart framework materials",
  "Energy and Photovoltaics",
  "Frontiers in Computational Modelling and AI",
  "Polymer Science and Engineering",
  "Materials for Space Technology",
  "Supramolecular Materials and Assemblies",
  "Sensors and Biosensors",
  "Next generation Nanomaterials",
  "Nanomaterials for Biomedical Applications",
  "Drug Discovery and Drug Delivery",
  "Emerging Techniques in Spectroscopy",
  "Catalysis and Synthetic Organic Chemistry",
  "Advanced Functional Materials",
  "Nuclear Materials",
  "Separation Science and Technology"
];

export default function About() {
  return (
    <section className={styles.about} aria-label="About MATCON 2026">
      <div className={styles.container}>
        
        {/* SECTION 1: THE CONFERENCE */}
        <div className={styles.segment}>
          <div className={styles.segment_meta}>
            <span className={styles.meta_id}>01/08</span>
            <span className={styles.meta_status}>// SYSTEM_ACTIVE</span>
            <div className={styles.conduit_v}></div>
          </div>

          <div className={styles.segment_content}>
            <div className={styles.ghost_title}>CONFERENCE</div>
            <h2 className={styles.title}>
              MAT<span className={styles.title_hi}>CON</span> 2026
            </h2>
            
            <div className={styles.body}>
              <p>
                MATCON 2026 is the <span className={styles.highlight}>8th international conference</span> of the prestigious MATCON series organized by the Department of Applied Chemistry, CUSAT.
                As a vital component of the scientific community, the conference aims at exchanging and nurturing innovative ideas of the latest and cutting-edge research among the academicians, scientists and industrialists all over the world.
              </p>
              <p>
                The 3-day international conference will be devoted to invited lectures by eminent academicians and scientists, oral presentations and poster presentations by researchers and budding scientists from various parts of the globe.
              </p>
            </div>
            
            <div className={styles.decorative_marker}>
              <span>SERIES_INDEX: VIII.26</span>
              <span>ARCHIVE: MATCON_INTL</span>
            </div>
          </div>

          <div className={styles.readout_panel}>
            <div className={styles.readout}>
              <div className={styles.readout_item}>
                <label>EDITION</label>
                <div className={styles.readout_val}>08.INTL</div>
              </div>
              <div className={styles.readout_item}>
                <label>DURATION</label>
                <div className={styles.readout_val}>72_HOURS</div>
              </div>
              <div className={styles.readout_item}>
                <label>AUDIENCE</label>
                <div className={styles.readout_val}>500+_RES</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: THE DEPARTMENT */}
        <div className={`${styles.segment} ${styles.segment_alt}`}>
          <div className={styles.segment_meta}>
            <span className={styles.meta_id}>02/08</span>
            <span className={styles.meta_status}>// DEPT_PROFILE</span>
            <div className={styles.conduit_v}></div>
          </div>

          <div className={styles.segment_content}>
            <div className={styles.ghost_title}>DEPARTMENT</div>
            <h2 className={styles.title}>
              APPLIED CHEMISTRY
            </h2>
            
            <div className={styles.body}>
              <p>
                Established in <span className={styles.highlight}>1976</span> to play an important role in the further development of the industrial belt in the greater Cochin area by providing scientific support and trained personnel to the industries. 
              </p>
              <p>
                The Department has now grown and emerged as one of the pioneering centers in Chemistry in the State of Kerala. The Department currently offers a five year Integrated M.Sc, two year M.Sc. and Ph.D. Programmes.
              </p>
            </div>

            <div className={styles.decorative_marker}>
              <span>INDEX: DEPT_APP_CHEM</span>
              <span>EST_YEAR: 1976</span>
            </div>
          </div>

          <div className={styles.readout_panel}>
            <div className={styles.readout}>
              <div className={styles.readout_item}>
                <label>FOUNDED</label>
                <div className={styles.readout_val}>EST_1976</div>
              </div>
              <div className={styles.readout_item}>
                <label>PROGRAMS</label>
                <div className={styles.readout_val}>03_ACTIVE</div>
              </div>
              <div className={styles.readout_item}>
                <label>LOCATION</label>
                <div className={styles.readout_val}>KOCHI.IN</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: THEMES */}
        <div className={styles.themes_section}>
          <div className={styles.themes_header}>
            <div className={styles.ghost_title}>THEMES</div>
            <div className={styles.meta_header}>
              <span className={styles.meta_id}>03/08</span>
              <span className={styles.meta_status}>// FOCUS_MATRIX</span>
            </div>
            <h2 className={styles.title}>CONFERENCE <span className={styles.title_hi}>THEMES</span></h2>
          </div>

          <div className={styles.themes_grid}>
            {THEMES.map((theme, idx) => (
              <div key={idx} className={styles.theme_card}>
                <span className={styles.theme_index}>T_{String(idx + 1).padStart(2, '0')}</span>
                <h3 className={styles.theme_name}>{theme}</h3>
                <div className={styles.theme_accent}></div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
