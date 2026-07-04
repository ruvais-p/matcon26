import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} aria-label="Conference Footer">
      <div className={styles.container}>
        <div className={styles.details_grid}>
          
          {/* Get in Touch */}
          <div className={styles.details_block}>
            <h4 className={styles.details_title}>Get in Touch</h4>
            <div className={styles.address}>
              <p>Department of Applied Chemistry</p>
              <p>Cochin University of Science and Technology</p>
              <p>Kochi, Kerala, India - 682 022</p>
            </div>
            <div className={styles.contact_info}>
              <a href="mailto:matcon2026@cusat.ac.in" className={styles.contact_link}>
                <EmailIcon /> matcon2026@cusat.ac.in
              </a>
              <a href="tel:+914842575804" className={styles.contact_link}>
                <PhoneIcon /> +91 484 257 5804
              </a>
            </div>
          </div>

          {/* University Branding */}
          <div className={styles.details_block}>
            <div className={styles.uni_branding}>
              <div className={styles.uni_logo_container}>
                <img 
                  src="/logo/cusat_logo.png" 
                  alt="CUSAT Logo" 
                  className={styles.uni_logo} 
                />
              </div>
              <h3 className={styles.uni_name}>
                Cochin University of <br /> Science and Technology
              </h3>
            </div>
          </div>

          {/* Quick Links & Follow Us */}
          <div className={styles.details_block}>
            <div className={styles.sub_block}>
              <h4 className={styles.details_title}>Quick Links</h4>
              <nav className={styles.quick_links}>
                <Link href="/">Home</Link>
                <Link href="/#about">About</Link>
                <Link href="/gallery">Gallery</Link>
                <Link href="/register">Register</Link>
              </nav>
            </div>
            
            <div className={styles.sub_block} style={{ marginTop: '30px' }}>
              <h4 className={styles.details_title}>Follow Us</h4>
              <div className={styles.social_links}>
                <a href="#" aria-label="Facebook"><FBIcon /></a>
                <a href="#" aria-label="LinkedIn"><LinkedInIcon /></a>
                <a href="#" aria-label="Instagram"><InstaIcon /></a>
                <a href="#" aria-label="Twitter"><TwitterIcon /></a>
              </div>
            </div>
          </div>

          {/* Location Map */}
          <div className={`${styles.details_block} ${styles.map_block}`}>
            <div className={styles.map_wrapper}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.56306352011!2d76.32629!3d10.0435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080c3f580c803f%3A0x69680c44c680c44!2sDepartment%20of%20Applied%20Chemistry!5e0!3m2!1sen!2sin!4v1713000000000!5m2!1sen!2sin"
                width="100%" 
                height="300" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className={styles.map_iframe}
              ></iframe>
            </div>
          </div>



        </div>

        <div className={styles.footer_bottom}>
          <p className={styles.copyright}>
            © 2026 Department of Applied Chemistry, CUSAT. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- ICON COMPONENTS ---

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

const FBIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const InstaIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
