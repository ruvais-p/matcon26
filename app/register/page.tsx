"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./register.module.css";
import Link from "next/link";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Script from "next/script";
import { getRegistrationFee } from "@/lib/fees";

type FormData = {
  title: string;
  name: string;
  designation: string;
  nationality: string;
  organization: string;
  email: string;
  contact: string;
  participationType: string;
  abstractTitle: string;
  abstractLink: string;
  accommodation: string;
  foodPreference: string;
};

const INITIAL_FORM: FormData = {
  title: "",
  name: "",
  designation: "",
  nationality: "",
  organization: "",
  email: "",
  contact: "",
  participationType: "",
  abstractTitle: "",
  abstractLink: "",
  accommodation: "",
  foodPreference: "",
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isTableScrollable, setIsTableScrollable] = useState(false);
  const [tableScrolled, setTableScrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeLink, setQrCodeLink] = useState<string | null>(null);
  const [currentFee, setCurrentFee] = useState<{ amount: number; currency: string } | null>(null);
  const feeTableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (form.designation && form.nationality && form.participationType) {
      const fee = getRegistrationFee({
        category: form.designation,
        nationality: form.nationality,
        participationType: form.participationType,
      });
      setCurrentFee(fee);
    } else {
      setCurrentFee(null);
    }
  }, [form.designation, form.nationality, form.participationType]);

  useEffect(() => {
    const el = feeTableRef.current;
    if (!el) return;
    const check = () => setIsTableScrollable(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const onScroll = () => setTableScrolled(true);
    el.addEventListener("scroll", onScroll, { once: true, passive: true });
    return () => { ro.disconnect(); el.removeEventListener("scroll", onScroll); };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setForm((prev) => ({ ...prev, contact: value }));
    if (errors.contact) {
      setErrors((prev) => ({ ...prev, contact: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.title) errs.title = "Please select a title.";
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.designation) errs.designation = "Please select a designation.";
    if (!form.nationality) errs.nationality = "Please select your nationality.";
    if (!form.organization.trim()) errs.organization = "Organization name is required.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "A valid email address is required.";
    if (!form.contact.trim()) errs.contact = "Contact number is required.";
    if (!form.participationType) errs.participationType = "Please select a participation type.";
    if (form.participationType === "poster_oral") {
      if (!form.abstractTitle.trim()) errs.abstractTitle = "Abstract title is required.";
      if (!form.abstractLink.trim()) errs.abstractLink = "Abstract link is required.";
    }
    if (!form.accommodation) errs.accommodation = "Please indicate accommodation preference.";
    if (!form.foodPreference) errs.foodPreference = "Please select a food preference.";
    return errs;
  };

  const makePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form }),
      });

      const orderData = await res.json();

      if (!orderData || orderData.error) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MATCON 2026",
        description: "Event Registration Fee",
        order_id: orderData.id,
        handler: async function (response: any) {
          console.log("Payment Successful:", response);
          try {
            const regRes = await fetch("/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                formData: form,
                paymentData: response,
              }),
            });

            const regData = await regRes.json();
            if (regData.success) {
              setQrCodeLink(regData.qrLink);
              setSubmitted(true);
            } else {
              throw new Error(regData.error || "Registration failed");
            }
          } catch (err: any) {
            console.error("Post-payment Registration Error:", err);
            alert("Payment was successful, but registration failed: " + err.message + ". Please contact support.");
          }
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.contact,
        },
        theme: {
          color: "#c8f04a",
        },
      };

      const rzp = (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("There was an issue initiating the payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrorKey = Object.keys(errs)[0];
      const el = document.getElementById(firstErrorKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    
    // Initiate Razorpay Payment
    await makePayment();
  };

  if (submitted) {
    return (
      <div className={styles.successPage}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <CheckCircleIcon />
          </div>
          <div className={styles.successMeta}>
            <span className={styles.metaTag}>// REG_COMPLETE</span>
          </div>
          <h1 className={styles.successTitle}>Registration Submitted</h1>
          <p className={styles.successMsg}>
            Thank you, <strong>{form.name}</strong>. Your registration for{" "}
            <strong>MATCON 2026</strong> has been received. A confirmation will
            be sent to <strong>{form.email}</strong>.
          </p>

          {qrCodeLink && (
            <div className={styles.ticketSection}>
              <h3 className={styles.ticketTitle}>Your Digital Ticket</h3>
              <div className={styles.qrContainer}>
                <img src={qrCodeLink} alt="Registration QR Code" className={styles.qrImage} />
              </div>
              <p className={styles.ticketNote}>Please save this QR code for event entry.</p>
              <a href={qrCodeLink} download={`MATCON2026_Ticket_${form.name}.png`} className={styles.downloadBtn}>
                Download Ticket
              </a>
            </div>
          )}

          <div className={styles.successDivider} />
          <Link href="/" className={styles.backBtn}>
            ← Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header Bar */}
      <header className={styles.pageHeader}>
        <Link href="/" className={styles.headerLogo}>
          MATCON <span>2026</span>
        </Link>
        <div className={styles.headerMeta}>
          <span className={styles.metaTag}>// EVENT_REG</span>
        </div>
      </header>

      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <main className={styles.main}>
        {/* Page Title Block */}
        <div className={styles.titleBlock}>
          <div className={styles.ghostTitle}>REGISTRATION</div>
          <h1 className={styles.pageTitle}>Event Registration Form</h1>
          <p className={styles.pageSubtitle}>
            MATCON 2026 · International Conference on Materials for a Sustainable Future
          </p>
          <div className={styles.titleDecoration}>
            <span className={styles.decorLine} />
            <span className={styles.decorDot} />
            <span className={styles.decorLine} />
          </div>
        </div>

        {/* Form */}
        <form
          className={styles.form}
          onSubmit={handleSubmit}
          noValidate
          aria-label="Event Registration Form"
        >
          {/* ── SECTION 1: Personal Details ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>01</span>
              <h2 className={styles.sectionTitle}>Personal Details</h2>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.fieldGrid}>
              {/* Title */}
              <div className={`${styles.fieldGroup} ${styles.fieldNarrow}`}>
                <label className={styles.label} htmlFor="title">
                  Title <span className={styles.required}>*</span>
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className={`${styles.select} ${errors.title ? styles.inputError : ""}`}
                    aria-describedby={errors.title ? "title-error" : undefined}
                  >
                    <option value="">Select</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mr.">Mr.</option>
                  </select>
                  <ChevronDownIcon />
                </div>
                {errors.title && (
                  <p className={styles.errorMsg} id="title-error" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Name */}
              <div className={`${styles.fieldGroup} ${styles.fieldWide}`}>
                <label className={styles.label} htmlFor="name">
                  Full Name <span className={styles.required}>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p className={styles.errorMsg} id="name-error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Designation */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="designation">
                  Designation <span className={styles.required}>*</span>
                </label>
                <div className={styles.optionGroup} role="group" aria-label="Designation">
                  {["Student", "Research Scholar / Fellow", "Faculty", "Industry"].map((opt) => {
                    const val = opt.toLowerCase().replace(/[\s/]+/g, "_");
                    return (
                      <label key={val} className={styles.optionLabel}>
                        <input
                          type="radio"
                          name="designation"
                          value={val}
                          checked={form.designation === val}
                          onChange={handleChange}
                          className={styles.radioInput}
                          id={`designation_${val}`}
                        />
                        <span className={styles.radioCustom} />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.designation && (
                  <p className={styles.errorMsg} id="designation-error" role="alert">
                    {errors.designation}
                  </p>
                )}
              </div>

              {/* Nationality */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Nationality <span className={styles.required}>*</span>
                </label>
                <div className={styles.optionGroupRow} role="group" aria-label="Nationality">
                  {["Indian", "Foreign"].map((opt) => (
                    <label key={opt} className={styles.optionLabel}>
                      <input
                        type="radio"
                        name="nationality"
                        value={opt.toLowerCase()}
                        checked={form.nationality === opt.toLowerCase()}
                        onChange={handleChange}
                        className={styles.radioInput}
                        id={`nationality_${opt.toLowerCase()}`}
                      />
                      <span className={styles.radioCustom} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {errors.nationality && (
                  <p className={styles.errorMsg} id="nationality-error" role="alert">
                    {errors.nationality}
                  </p>
                )}
              </div>

              {/* Organization */}
              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label} htmlFor="organization">
                  Name of Organization <span className={styles.required}>*</span>
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={form.organization}
                  onChange={handleChange}
                  placeholder="Enter your institution or organization"
                  className={`${styles.input} ${errors.organization ? styles.inputError : ""}`}
                  aria-describedby={errors.organization ? "organization-error" : undefined}
                />
                {errors.organization && (
                  <p className={styles.errorMsg} id="organization-error" role="alert">
                    {errors.organization}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Contact Information ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>02</span>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.fieldGrid}>
              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="email">
                  Email ID <span className={styles.required}>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className={styles.errorMsg} id="email-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="contact">
                  Contact Number <span className={styles.required}>*</span>
                </label>
                <div className={`${styles.phoneInputContainer} ${errors.contact ? styles.phoneInputError : ""}`}>
                  <PhoneInput
                    country={"in"}
                    value={form.contact}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: "contact",
                      id: "contact",
                      required: true,
                      autoComplete: "tel",
                    }}
                    containerClass={styles.phoneInput}
                    inputClass={styles.phoneInputInner}
                    buttonClass={styles.phoneButton}
                    dropdownClass={styles.phoneDropdown}
                  />
                </div>
                <p className={styles.fieldNote}>Preferably WhatsApp number</p>
                {errors.contact && (
                  <p className={styles.errorMsg} id="contact-error" role="alert">
                    {errors.contact}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Participation Type ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>03</span>
              <h2 className={styles.sectionTitle}>Participation Type</h2>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.fieldGrid}>
              <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                <label className={styles.label}>
                  Select your mode of participation{" "}
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.participationCards}>
                  {[
                    {
                      value: "participation_only",
                      label: "Participation Only",
                      desc: "Attend the conference as a participant",
                    },
                    {
                      value: "poster_oral",
                      label: "Poster / Oral",
                      desc: "Present a poster or oral presentation",
                    },
                    {
                      value: "lecture",
                      label: "Lecture",
                      desc: "Deliver an invited lecture",
                    },
                  ].map(({ value, label, desc }) => (
                    <label
                      key={value}
                      className={`${styles.participationCard} ${
                        form.participationType === value
                          ? styles.participationCardActive
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="participationType"
                        value={value}
                        checked={form.participationType === value}
                        onChange={handleChange}
                        className={styles.radioInput}
                        id={`participationType_${value}`}
                      />
                      <span className={styles.cardLabel}>{label}</span>
                      <span className={styles.cardDesc}>{desc}</span>
                    </label>
                  ))}
                </div>
                {errors.participationType && (
                  <p className={styles.errorMsg} id="participationType-error" role="alert">
                    {errors.participationType}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Abstract Submission (Conditional) ── */}
          {form.participationType === "poster_oral" && (
            <div className={`${styles.section} ${styles.sectionConditional}`}>
              <div className={styles.sectionHeader}>
                <span className={`${styles.sectionIndex} ${styles.sectionIndexAccent}`}>
                  04
                </span>
                <h2 className={styles.sectionTitle}>Abstract Submission</h2>
                <div className={styles.sectionLine} />
                <span className={styles.conditionalBadge}>Required for Poster/Oral</span>
              </div>

              <div className={styles.fieldGrid}>
                {/* Abstract Title */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="abstractTitle">
                    Title of the Abstract <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="abstractTitle"
                    name="abstractTitle"
                    type="text"
                    value={form.abstractTitle}
                    onChange={handleChange}
                    placeholder="Enter the title of your abstract"
                    className={`${styles.input} ${errors.abstractTitle ? styles.inputError : ""}`}
                    aria-describedby={errors.abstractTitle ? "abstractTitle-error" : undefined}
                  />
                  {errors.abstractTitle && (
                    <p className={styles.errorMsg} id="abstractTitle-error" role="alert">
                      {errors.abstractTitle}
                    </p>
                  )}
                </div>

                {/* Abstract Link */}
                <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="abstractLink">
                    Abstract Link <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="abstractLink"
                    name="abstractLink"
                    type="url"
                    value={form.abstractLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/... or any accessible link"
                    className={`${styles.input} ${errors.abstractLink ? styles.inputError : ""}`}
                    aria-describedby={errors.abstractLink ? "abstractLink-error" : undefined}
                  />
                  <p className={styles.fieldNote}>
                    Provide a publicly accessible link (Google Drive, Dropbox, etc.)
                  </p>
                  {errors.abstractLink && (
                    <p className={styles.errorMsg} id="abstractLink-error" role="alert">
                      {errors.abstractLink}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 5: Logistics ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>
                {form.participationType === "poster_oral" ? "05" : "04"}
              </span>
              <h2 className={styles.sectionTitle}>Logistics</h2>
              <div className={styles.sectionLine} />
            </div>

            <div className={styles.fieldGrid}>
              {/* Accommodation */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Accommodation Required?{" "}
                  <span className={styles.required}>*</span>
                </label>
                <div className={styles.optionGroupRow} role="group" aria-label="Accommodation">
                  {["Yes", "No"].map((opt) => (
                    <label key={opt} className={styles.optionLabel}>
                      <input
                        type="radio"
                        name="accommodation"
                        value={opt.toLowerCase()}
                        checked={form.accommodation === opt.toLowerCase()}
                        onChange={handleChange}
                        className={styles.radioInput}
                        id={`accommodation_${opt.toLowerCase()}`}
                      />
                      <span className={styles.radioCustom} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                <p className={styles.fieldNote}>
                  Details of the accommodation will be intimated later.
                </p>
                {errors.accommodation && (
                  <p className={styles.errorMsg} id="accommodation-error" role="alert">
                    {errors.accommodation}
                  </p>
                )}
              </div>

              {/* Food Preference */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Food Preference <span className={styles.required}>*</span>
                </label>
                <div className={styles.optionGroupRow} role="group" aria-label="Food Preference">
                  {[
                    { val: "veg", label: "Vegetarian" },
                    { val: "non_veg", label: "Non-Vegetarian" },
                  ].map(({ val, label }) => (
                    <label key={val} className={styles.optionLabel}>
                      <input
                        type="radio"
                        name="foodPreference"
                        value={val}
                        checked={form.foodPreference === val}
                        onChange={handleChange}
                        className={styles.radioInput}
                        id={`foodPreference_${val}`}
                      />
                      <span className={styles.radioCustom} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {errors.foodPreference && (
                  <p className={styles.errorMsg} id="foodPreference-error" role="alert">
                    {errors.foodPreference}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Registration Fee Table ── */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>05</span>
              <h2 className={styles.sectionTitle}>Registration Fee</h2>
              <div className={styles.sectionLine} />
            </div>

            {isTableScrollable && !tableScrolled && (
              <div className={styles.swipeHint} aria-hidden="true">
                <span className={styles.swipeHintArrow}>&#8592; &#8594;</span>
                <span>Swipe to see more</span>
              </div>
            )}

            <div ref={feeTableRef} className={styles.feeTableWrap}>
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
                  {[
                    { cat: "Students",          vals: [3000, 3500, 4000, 4500, 5000] },
                    { cat: "Research Scholars", vals: [3500, 4000, 4500, 5000, 5500] },
                    { cat: "Faculty",           vals: [6000, 7000, 7000, 8000, 8000] },
                    { cat: "Industry",          vals: [12000, 15000, 13000, 16000, 14000] },
                    { cat: "Foreign Students",  vals: [250, 300, 350, 400, 450], usd: true },
                    { cat: "Foreign Scholars",  vals: [350, 400, 450, 500, 550], usd: true },
                    { cat: "Foreign Faculty",   vals: [500, 600, 600, 700, 700], usd: true },
                  ].map(({ cat, vals, usd }) => (
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

            <div className={styles.feeDeadlines}>
              <span className={styles.feeDeadline}>
                Early Bird deadline: <strong>July 25</strong>
              </span>
              <span className={styles.feeDeadlineSep}>|</span>
              <span className={styles.feeDeadline}>
                Late Registration deadline: <strong>October 25</strong>
              </span>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className={styles.submitRow}>
            <div className={styles.submitInfo}>
              <p className={styles.submitNote}>
                Fields marked with <span className={styles.required}>*</span> are required.
              </p>
              {currentFee && (
                <div className={styles.feeHighlight}>
                  Total Fee: <strong>{currentFee.currency === "INR" ? `₹${currentFee.amount.toLocaleString("en-IN")}` : `$${currentFee.amount}`}</strong>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className={styles.submitBtn} 
              id="submit-btn"
              disabled={isProcessing}
            >
              <span>{isProcessing ? "Processing..." : "Submit Registration"}</span>
              <ArrowRightIcon />
            </button>
          </div>

        </form>
      </main>

      {/* Footer Strip */}
      <footer className={styles.pageFooter}>
        <span>© 2026 Department of Applied Chemistry, CUSAT</span>
        <span className={styles.metaTag}>// MATCON_INTL</span>
      </footer>
    </div>
  );
}

// ── Icon Components ──

const ChevronDownIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
