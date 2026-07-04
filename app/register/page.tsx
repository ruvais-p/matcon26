"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./register.module.css";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FormData = {
    paymentId: string;
    name: string;
    email: string;
    phone: string;
    foodPreference: string;
    accommodation: string;
};

const INITIAL_FORM: FormData = {
    paymentId: "",
    name: "",
    email: "",
    phone: "",
    foodPreference: "",
    accommodation: "",
};

type FormErrors = Partial<Record<keyof FormData, string>> & { abstract?: string };

export default function RegisterPage() {
    const [form, setForm] = useState<FormData>(INITIAL_FORM);
    const [abstractFile, setAbstractFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isTableScrollable, setIsTableScrollable] = useState(false);
    const [tableScrolled, setTableScrolled] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const feeTableRef = useRef<HTMLDivElement>(null);

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

    const handleFileChange = (selectedFile: File) => {
        const validExtensions = [".pdf", ".doc", ".docx"];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setErrors((prev) => ({ ...prev, abstract: "Invalid file format. Only PDF, DOC, and DOCX are allowed." }));
            setAbstractFile(null);
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setErrors((prev) => ({ ...prev, abstract: "File size exceeds the 10MB limit." }));
            setAbstractFile(null);
            return;
        }

        setAbstractFile(selectedFile);
        setErrors((prev) => ({ ...prev, abstract: undefined }));
    };

    const handleRemoveFile = () => {
        setAbstractFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validate = (): FormErrors => {
        const errs: FormErrors = {};
        if (!form.paymentId.trim()) errs.paymentId = "Payment ID is required.";
        if (!form.name.trim()) errs.name = "Name is required.";
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            errs.email = "A valid email address is required.";
        if (!form.phone.trim()) errs.phone = "Phone number is required.";
        if (!abstractFile) errs.abstract = "Abstract file is required.";
        if (!form.foodPreference) errs.foodPreference = "Please select a food preference.";
        if (!form.accommodation) errs.accommodation = "Please indicate if accommodation is needed.";
        return errs;
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

        setSubmitting(true);
        setSubmitError(null);

        try {
            if (!abstractFile) {
                throw new Error("Abstract file is missing.");
            }

            // 1. Upload abstract file to Supabase storage bucket 'abstracts'
            const fileExt = abstractFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("abstracts")
                .upload(fileName, abstractFile);

            if (uploadError) {
                console.error("Storage upload error details:", uploadError);
                throw new Error(`Failed to upload abstract to storage: ${uploadError.message}. Make sure the 'abstracts' storage bucket exists in Supabase and has public insert policies enabled.`);
            }

            // Get public URL of uploaded file
            const { data: { publicUrl } } = supabase.storage
                .from("abstracts")
                .getPublicUrl(fileName);

            // 2. Insert row into 'bookings' table
            const { data: insertData, error: insertError } = await supabase
                .from("bookings")
                .insert([
                    {
                        payment_id: form.paymentId,
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                        abstract_url: publicUrl,
                        food_preference: form.foodPreference,
                        accommodation_needed: form.accommodation,
                    }
                ]);

            if (insertError) {
                console.error("Database insert error details:", insertError);
                throw new Error(`Failed to save booking to database: ${insertError.message}. Make sure the 'bookings' table exists in Supabase.`);
            }

            setSubmitted(true);
        } catch (err: any) {
            setSubmitError(err.message || "An unexpected error occurred during registration. Please try again.");
            console.error("Submission error details:", err);
        } finally {
            setSubmitting(false);
        }
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
                        <strong>MATCON 2026</strong> has been received.
                    </p>

                    <div className={styles.successDetailsGrid}>
                        <div className={styles.successDetailItem}>
                            <span className={styles.successDetailLabel}>Payment ID</span>
                            <span className={styles.successDetailValue}>{form.paymentId}</span>
                        </div>
                        <div className={styles.successDetailItem}>
                            <span className={styles.successDetailLabel}>Email</span>
                            <span className={styles.successDetailValue}>{form.email}</span>
                        </div>
                        <div className={styles.successDetailItem}>
                            <span className={styles.successDetailLabel}>Phone</span>
                            <span className={styles.successDetailValue}>{form.phone}</span>
                        </div>
                        <div className={styles.successDetailItem}>
                            <span className={styles.successDetailLabel}>Food Preference</span>
                            <span className={styles.successDetailValue}>
                                {form.foodPreference === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                            </span>
                        </div>
                        <div className={styles.successDetailItem}>
                            <span className={styles.successDetailLabel}>Accommodation</span>
                            <span className={styles.successDetailValue}>
                                {form.accommodation === "yes" ? "Yes" : "No"}
                            </span>
                        </div>
                        {abstractFile && (
                            <div className={styles.successDetailItem}>
                                <span className={styles.successDetailLabel}>Abstract File</span>
                                <span className={styles.successDetailValue}>{abstractFile.name}</span>
                            </div>
                        )}
                    </div>

                    <p className={styles.successSubMsg}>
                        Our team will verify the payment reference ID <strong>{form.paymentId}</strong> and send a confirmation to your email.
                    </p>
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

                {/* ── STEP 1: Payment Section ── */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionIndex}>01</span>
                        <h2 className={styles.sectionTitle}>Registration Fee & Payment</h2>
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
                                    <th className={styles.feeTh} colSpan={2}>Regular Registration</th>
                                    <th className={styles.feeTh}>Spot Registration</th>
                                </tr>
                                <tr>
                                    <th className={styles.feeThSub}>Participation</th>
                                    <th className={styles.feeThSub}>Invited Delegates/<br />Oral/Poster</th>
                                    <th className={styles.feeThSub}>Participation</th>
                                    <th className={styles.feeThSub}>Invited Delegates/<br />Oral/Poster</th>
                                    <th className={styles.feeThSub}>Participation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Indian categories — all 5 columns */}
                                {[
                                    { cat: "Students",          vals: [3000, 3500, 4000, 4500, 5000] },
                                    { cat: "Research Scholars", vals: [3500, 4000, 4500, 5000, 5500] },
                                    { cat: "Faculty",           vals: [6000, 7000, 7000, 8000, 8000] },
                                    { cat: "Industry",          vals: [12000, 15000, 13000, 16000, 14000] },
                                ].map(({ cat, vals }) => (
                                    <tr key={cat} className={styles.feeTr}>
                                        <td className={styles.feeTdCat}>{cat}</td>
                                        {vals.map((v, i) => (
                                            <td key={i} className={styles.feeTd}>
                                                ₹{v.toLocaleString("en-IN")}
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Foreign categories — merged participation+oral columns */}
                                {[
                                    { cat: "Foreign Scholars", earlyBird: 100, regular: 150, spot: 200 },
                                    { cat: "Foreign Faculty",  earlyBird: 200, regular: 250, spot: 300 },
                                ].map(({ cat, earlyBird, regular, spot }) => (
                                    <tr key={cat} className={styles.feeTr}>
                                        <td className={styles.feeTdCat}>{cat}</td>
                                        <td className={styles.feeTd} colSpan={2}>${earlyBird}</td>
                                        <td className={styles.feeTd} colSpan={2}>${regular}</td>
                                        <td className={styles.feeTd}>${spot}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className={styles.feeNote}>
                        * An 18% GST will be applicable in addition to the registration fee.
                    </p>

                    <div className={styles.feeDeadlines}>
                        <span className={styles.feeDeadline}>
                            Early Bird deadline: <strong>July 25</strong>
                        </span>
                        <span className={styles.feeDeadlineSep}>|</span>
                        <span className={styles.feeDeadline}>
                            Regular Registration deadline: <strong>October 25</strong>
                        </span>
                    </div>

                    <div className={styles.paymentActionBox}>
                        <p className={styles.paymentText}>
                            Please make your registration payment through SBI Collect. Clicking the button below will open the SBI Collect portal in a new tab.
                        </p>
                        <a
                            href="https://onlinesbi.sbi.bank.in/sbicollect/icollecthome.htm?corpID=7053967"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.applyPayBtn}
                        >
                            <span>Apply and Pay</span>
                            <ExternalLinkIcon />
                        </a>
                    </div>

                    <div className={styles.noteAlert}>
                        <div className={styles.noteAlertIcon}>
                            <InfoIcon />
                        </div>
                        <p className={styles.noteAlertText}>
                            after completing the payment using above link, submit this form to complete the registration.
                        </p>
                    </div>
                </div>

                {/* ── STEP 2: Form Section ── */}
                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    noValidate
                    aria-label="Event Registration Form"
                >
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionIndex}>02</span>
                            <h2 className={styles.sectionTitle}>Registration Details</h2>
                            <div className={styles.sectionLine} />
                        </div>

                        <div className={styles.fieldGrid}>
                            {/* Payment ID */}
                            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                                <label className={styles.label} htmlFor="paymentId">
                                    Payment ID <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="paymentId"
                                    name="paymentId"
                                    type="text"
                                    value={form.paymentId}
                                    onChange={handleChange}
                                    placeholder="Enter SBI Collect Reference Number (e.g. DUXXXXXXXX)"
                                    className={`${styles.input} ${errors.paymentId ? styles.inputError : ""}`}
                                    aria-describedby={errors.paymentId ? "paymentId-error" : undefined}
                                    disabled={submitting}
                                />
                                {errors.paymentId && (
                                    <p className={styles.errorMsg} id="paymentId-error" role="alert">
                                        {errors.paymentId}
                                    </p>
                                )}
                            </div>

                            {/* Name */}
                            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                                <label className={styles.label} htmlFor="name">
                                    Name <span className={styles.required}>*</span>
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
                                    disabled={submitting}
                                />
                                {errors.name && (
                                    <p className={styles.errorMsg} id="name-error" role="alert">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="email">
                                    Email <span className={styles.required}>*</span>
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
                                    disabled={submitting}
                                />
                                {errors.email && (
                                    <p className={styles.errorMsg} id="email-error" role="alert">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label} htmlFor="phone">
                                    Phone No. <span className={styles.required}>*</span>
                                </label>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="+91 XXXXX XXXXX"
                                    className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                                    aria-describedby={errors.phone ? "phone-error" : undefined}
                                    disabled={submitting}
                                />
                                {errors.phone && (
                                    <p className={styles.errorMsg} id="phone-error" role="alert">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            {/* Abstract File */}
                            <div className={`${styles.fieldGroup} ${styles.fieldFull}`}>
                                <label className={styles.label}>
                                    Abstract (PDF / Word / DOCX) <span className={styles.required}>*</span>
                                </label>
                                <div
                                    className={`${styles.fileDropzone} ${errors.abstract ? styles.inputError : ""} ${submitting ? styles.disabledDropzone : ""}`}
                                    onDragOver={(e) => !submitting && e.preventDefault()}
                                    onDrop={(e) => {
                                        if (submitting) return;
                                        e.preventDefault();
                                        const droppedFile = e.dataTransfer.files[0];
                                        if (droppedFile) handleFileChange(droppedFile);
                                    }}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={(e) => {
                                            const selectedFile = e.target.files?.[0];
                                            if (selectedFile) handleFileChange(selectedFile);
                                        }}
                                        accept=".pdf,.doc,.docx"
                                        style={{ display: "none" }}
                                        id="abstract"
                                        disabled={submitting}
                                    />
                                    {!abstractFile ? (
                                        <div className={styles.dropzoneContent} onClick={() => !submitting && fileInputRef.current?.click()}>
                                            <UploadIcon />
                                            <p className={styles.dropzoneText}>
                                                Drag and drop your abstract file here, or <span>browse</span>
                                            </p>
                                            <p className={styles.dropzoneHint}>Supports PDF, DOC, or DOCX (Max 10MB)</p>
                                        </div>
                                    ) : (
                                        <div className={styles.fileSelectedInfo}>
                                            <FileIcon />
                                            <div className={styles.fileDetails}>
                                                <span className={styles.fileName}>{abstractFile.name}</span>
                                                <span className={styles.fileSize}>{(abstractFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                            </div>
                                            <button
                                                type="button"
                                                className={styles.removeFileBtn}
                                                onClick={handleRemoveFile}
                                                disabled={submitting}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.abstract && (
                                    <p className={styles.errorMsg} role="alert">
                                        {errors.abstract}
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
                                        { val: "non-veg", label: "Non-Vegetarian" },
                                    ].map(({ val, label }) => (
                                        <label key={val} className={`${styles.optionLabel} ${submitting ? styles.disabledLabel : ""}`}>
                                            <input
                                                type="radio"
                                                name="foodPreference"
                                                value={val}
                                                checked={form.foodPreference === val}
                                                onChange={handleChange}
                                                className={styles.radioInput}
                                                id={`foodPreference_${val}`}
                                                disabled={submitting}
                                            />
                                            <span className={styles.radioCustom} />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.foodPreference && (
                                    <p className={styles.errorMsg} role="alert">
                                        {errors.foodPreference}
                                    </p>
                                )}
                            </div>

                            {/* Accommodation Needed */}
                            <div className={styles.fieldGroup}>
                                <label className={styles.label}>
                                    Accommodation Needed? <span className={styles.required}>*</span>
                                </label>
                                <div className={styles.optionGroupRow} role="group" aria-label="Accommodation Needed">
                                    {[
                                        { val: "yes", label: "Yes" },
                                        { val: "no", label: "No" },
                                    ].map(({ val, label }) => (
                                        <label key={val} className={`${styles.optionLabel} ${submitting ? styles.disabledLabel : ""}`}>
                                            <input
                                                type="radio"
                                                name="accommodation"
                                                value={val}
                                                checked={form.accommodation === val}
                                                onChange={handleChange}
                                                className={styles.radioInput}
                                                id={`accommodation_${val}`}
                                                disabled={submitting}
                                            />
                                            <span className={styles.radioCustom} />
                                            <span>{label}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.accommodation && (
                                    <p className={styles.errorMsg} role="alert">
                                        {errors.accommodation}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {submitError && (
                        <div className={styles.submitErrorAlert}>
                            <p>{submitError}</p>
                        </div>
                    )}

                    {/* ── Submit ── */}
                    <div className={styles.submitRow}>
                        <p className={styles.submitNote}>
                            Fields marked with <span className={styles.required}>*</span> are required.
                        </p>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            id="submit-btn"
                            disabled={submitting}
                        >
                            <span>{submitting ? "Submitting..." : "Submit Registration"}</span>
                            {submitting ? <SpinnerIcon /> : <ArrowRightIcon />}
                        </button>
                    </div>
                </form>
            </main>

        </div>
    );
}

// ── Icon Components ──

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

const ExternalLinkIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const InfoIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const UploadIcon = () => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--accent, #c8f04a)", opacity: 0.8 }}
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const FileIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ color: "var(--accent, #c8f04a)" }}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const TrashIcon = () => (
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
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

const SpinnerIcon = () => (
    <svg
        className={styles.spinner}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
);