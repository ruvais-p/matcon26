"use client";

import { useState, useTransition, useEffect } from "react";
import {
  updateBookingStatus,
  confirmAndSendTicket,
  logoutAdmin,
  addSpeaker,
  updateSpeaker,
  deleteSpeaker,
  reorderSpeakers,
  uploadSpeakerImage,
  SpeakerItem,
} from "./actions";
import styles from "./manage.module.css";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import * as XLSX from "xlsx";

type Booking = {
  id: string;
  payment_id: string;
  name: string;
  organisation?: string;
  category?: string;
  email: string;
  phone: string;
  abstract_url: string;
  food_preference: string;
  accommodation_needed: string;
  status: string;
  created_at: string;
  type: string;
  theme: string;
};

type DashboardProps = {
  initialBookings: Booking[];
  fetchError: string | null;
  initialSpeakers?: SpeakerItem[];
};

export default function AdminDashboard({
  initialBookings,
  fetchError,
  initialSpeakers = [],
}: DashboardProps) {
  // Main View Switcher: Bookings or Speakers
  const [mainView, setMainView] = useState<"bookings" | "speakers">("bookings");

  // Bookings States
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accept" | "reject">("all");
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);
  const [ticketQrUrl, setTicketQrUrl] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Speakers States
  const [speakers, setSpeakers] = useState<SpeakerItem[]>(initialSpeakers);
  const [speakerSearch, setSpeakerSearch] = useState("");
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false);
  const [editingSpeakerIndex, setEditingSpeakerIndex] = useState<number | null>(null);
  const [deletingSpeakerIndex, setDeletingSpeakerIndex] = useState<number | null>(null);
  const [speakerForm, setSpeakerForm] = useState({
    name: "",
    designation: "",
    department: "",
    organization: "",
    country: "India",
    image: "",
  });
  const [uploadedWebpData, setUploadedWebpData] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [isSpeakerSubmitting, setIsSpeakerSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const [isPending, startTransition] = useTransition();

  const handleImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      setNotification({
        message: "Please select a valid image file.",
        type: "error",
      });
      return;
    }

    setIsConvertingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new (window as any).Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsConvertingImage(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        // Convert to WebP format with 85% high quality compression
        const webpDataUrl = canvas.toDataURL("image/webp", 0.85);
        setUploadedWebpData(webpDataUrl);
        setUploadedFileName(file.name);
        setIsConvertingImage(false);
      };
      img.onerror = () => {
        setIsConvertingImage(false);
        setNotification({
          message: "Failed to convert image to WebP.",
          type: "error",
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const openAddSpeakerModal = () => {
    setEditingSpeakerIndex(null);
    setUploadedWebpData(null);
    setUploadedFileName("");
    setSpeakerForm({
      name: "",
      designation: "",
      department: "",
      organization: "",
      country: "India",
      image: "",
    });
    setIsSpeakerModalOpen(true);
  };

  const openEditSpeakerModal = (index: number) => {
    const s = speakers[index];
    if (!s) return;
    setEditingSpeakerIndex(index);
    setUploadedWebpData(null);
    setUploadedFileName("");
    setSpeakerForm({
      name: s.name || "",
      designation: s.designation || "",
      department: s.department || "",
      organization: s.organization || s.institution || "",
      country: s.country || "India",
      image: s.image || "",
    });
    setIsSpeakerModalOpen(true);
  };

  const handleSaveSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerForm.name.trim() || !speakerForm.designation.trim()) {
      setNotification({
        message: "Please provide both Speaker Name and Designation.",
        type: "error",
      });
      return;
    }

    setIsSpeakerSubmitting(true);
    try {
      let finalImage = speakerForm.image ? speakerForm.image.trim() : "";

      // If user uploaded a new image, save it as WebP named after the speaker
      if (uploadedWebpData) {
        const uploadRes = await uploadSpeakerImage(speakerForm.name, uploadedWebpData);
        if (uploadRes.success && uploadRes.fileName) {
          finalImage = uploadRes.fileName;
        } else {
          throw new Error(uploadRes.error || "Failed to save converted WebP image.");
        }
      }

      if (editingSpeakerIndex !== null) {
        const targetSpeaker = speakers[editingSpeakerIndex];
        // Edit existing speaker
        const res = await updateSpeaker(targetSpeaker?.id || editingSpeakerIndex, {
          id: targetSpeaker?.id,
          name: speakerForm.name,
          designation: speakerForm.designation,
          department: speakerForm.department,
          organization: speakerForm.organization,
          country: speakerForm.country,
          image: finalImage,
        });

        if (res.success && res.data) {
          setSpeakers(res.data);
          setIsSpeakerModalOpen(false);
          setNotification({
            message: `Speaker "${speakerForm.name}" updated successfully.`,
            type: "success",
          });
        } else {
          throw new Error(res.error || "Failed to update speaker");
        }
      } else {
        // Add new speaker
        const res = await addSpeaker({
          name: speakerForm.name,
          designation: speakerForm.designation,
          department: speakerForm.department,
          organization: speakerForm.organization,
          country: speakerForm.country,
          image: finalImage,
        });

        if (res.success && res.data) {
          setSpeakers(res.data);
          setIsSpeakerModalOpen(false);
          setNotification({
            message: `Speaker "${speakerForm.name}" added successfully.`,
            type: "success",
          });
        } else {
          throw new Error(res.error || "Failed to add speaker");
        }
      }
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to save speaker details.",
        type: "error",
      });
    } finally {
      setIsSpeakerSubmitting(false);
    }
  };

  const handleConfirmDeleteSpeaker = async () => {
    if (deletingSpeakerIndex === null) return;
    const target = speakers[deletingSpeakerIndex];
    const targetName = target ? target.name : "Speaker";
    setIsSpeakerSubmitting(true);

    try {
      const res = await deleteSpeaker(target?.id || deletingSpeakerIndex);
      if (res.success && res.data) {
        setSpeakers(res.data);
        setDeletingSpeakerIndex(null);
        setNotification({
          message: `Speaker "${targetName}" removed successfully.`,
          type: "success",
        });
      } else {
        throw new Error(res.error || "Failed to delete speaker");
      }
    } catch (err: any) {
      setNotification({
        message: err.message || "Failed to delete speaker.",
        type: "error",
      });
    } finally {
      setIsSpeakerSubmitting(false);
    }
  };

  const handleMoveSpeaker = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= speakers.length) return;

    const newSpeakers = [...speakers];
    const [moved] = newSpeakers.splice(index, 1);
    newSpeakers.splice(targetIndex, 0, moved);

    setSpeakers(newSpeakers);

    try {
      const res = await reorderSpeakers(newSpeakers);
      if (res.success && res.data) {
        setSpeakers(res.data);
      }
    } catch (err: any) {
      console.error("Reorder error:", err);
    }
  };

  // Clear notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Generate QR code when a ticket is opened
  useEffect(() => {
    if (selectedTicketBooking) {
      const qrData = JSON.stringify({
        bookingId: selectedTicketBooking.id,
        name: selectedTicketBooking.name,
        paymentId: selectedTicketBooking.payment_id,
        email: selectedTicketBooking.email,
        type: selectedTicketBooking.type || "",
        theme: selectedTicketBooking.theme || "",
        food: selectedTicketBooking.food_preference,
        accommodation: selectedTicketBooking.accommodation_needed,
        event: "MATCON 2026"
      });
      QRCode.toDataURL(qrData, { width: 180, margin: 1, color: { dark: "#020e04", light: "#ffffff" } })
        .then(setTicketQrUrl)
        .catch((err) => console.error("Failed to generate QR code:", err));
    } else {
      setTicketQrUrl("");
    }
  }, [selectedTicketBooking]);

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.reload();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    const previousBookings = [...bookings];
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await updateBookingStatus(id, newStatus);
      setNotification({
        message: `Booking status updated to ${newStatus}.`,
        type: "success",
      });
    } catch (err: any) {
      setBookings(previousBookings);
      setNotification({
        message: err.message || "Failed to update booking status.",
        type: "error",
      });
    }
  };

  const handleConfirmAndSend = async (booking: Booking) => {
    if (isPending) return;

    startTransition(async () => {
      try {
        const res = await confirmAndSendTicket(booking.id);
        if (res.success) {
          setBookings((prev) =>
            prev.map((b) => (b.id === booking.id ? { ...b, status: "accept" } : b))
          );
          setNotification({
            message: res.message,
            type: "success",
          });
          // Show ticket preview modal
          setSelectedTicketBooking({ ...booking, status: "accept" });
        }
      } catch (err: any) {
        setNotification({
          message: err.message || "Failed to confirm and send ticket.",
          type: "error",
        });
      }
    });
  };

  const handleExportExcel = (exportAll: boolean = false) => {
    const dataToExport = exportAll ? bookings : filteredBookings;
    if (!dataToExport || dataToExport.length === 0) {
      setNotification({
        message: "No registration records available to export.",
        type: "error",
      });
      return;
    }

    try {
      const formattedRows = dataToExport.map((b, index) => ({
        "SL No": index + 1,
        "Submission Date": b.created_at
          ? new Date(b.created_at).toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "N/A",
        "Full Name": b.name || "N/A",
        "Email Address": b.email || "N/A",
        "Phone Number": b.phone || "N/A",
        "Organisation / Institution": b.organisation || "N/A",
        "Category": b.category ? b.category.replace(/_/g, " ").toUpperCase() : "N/A",
        "Presentation Type": b.type ? b.type.toUpperCase() : "N/A",
        "Theme / Track": b.theme || "N/A",
        "Food Preference":
          b.food_preference === "veg"
            ? "Vegetarian"
            : b.food_preference === "non-veg"
            ? "Non-Vegetarian"
            : b.food_preference || "N/A",
        "Accommodation Needed": b.accommodation_needed === "yes" ? "Yes" : "No",
        "Payment ID": b.payment_id || "N/A",
        "Verification Status": b.status
          ? b.status.charAt(0).toUpperCase() + b.status.slice(1)
          : "Pending",
        "Abstract URL": b.abstract_url || "N/A",
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedRows);

      // Auto-fit column widths for clear spreadsheet viewing
      worksheet["!cols"] = [
        { wch: 8 },  // SL No
        { wch: 22 }, // Submission Date
        { wch: 26 }, // Full Name
        { wch: 30 }, // Email Address
        { wch: 18 }, // Phone Number
        { wch: 32 }, // Organisation
        { wch: 20 }, // Category
        { wch: 18 }, // Presentation Type
        { wch: 30 }, // Theme
        { wch: 18 }, // Food
        { wch: 22 }, // Accommodation
        { wch: 24 }, // Payment ID
        { wch: 18 }, // Verification Status
        { wch: 50 }, // Abstract URL
      ];

      // Create workbook and append sheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

      // Timestamped filename
      const dateStr = new Date().toISOString().slice(0, 10);
      const filterTag = exportAll ? "All" : activeTab === "all" ? "Filtered" : activeTab.toUpperCase();
      const fileName = `MATCON2026_Registrations_${filterTag}_${dateStr}.xlsx`;

      // Export file
      XLSX.writeFile(workbook, fileName);

      setNotification({
        message: `Exported ${dataToExport.length} registration(s) to ${fileName} successfully!`,
        type: "success",
      });
    } catch (err: any) {
      console.error("Failed to export registrations to Excel:", err);
      setNotification({
        message: "Failed to export Excel file: " + (err.message || "Unknown error"),
        type: "error",
      });
    }
  };

  // Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.status === "accept").length;
  const rejectedCount = bookings.filter((b) => b.status === "reject").length;
  
  const vegCount = bookings.filter((b) => b.food_preference === "veg").length;
  const nonVegCount = bookings.filter((b) => b.food_preference === "non-veg").length;
  const accNeededCount = bookings.filter((b) => b.accommodation_needed === "yes").length;

  // Speaker metrics & filtering
  const filteredSpeakers = speakers.filter((s) => {
    if (!speakerSearch.trim()) return true;
    const query = speakerSearch.toLowerCase();
    const org = (s.organization || s.institution || "").toLowerCase();
    const dept = (s.department || "").toLowerCase();
    const country = (s.country || "").toLowerCase();
    return (
      s.name.toLowerCase().includes(query) ||
      s.designation.toLowerCase().includes(query) ||
      org.includes(query) ||
      dept.includes(query) ||
      country.includes(query)
    );
  });

  const uniqueOrgsCount = new Set(
    speakers.map((s) => (s.organization || s.institution || "").trim()).filter(Boolean)
  ).size;
  const uniqueCountriesCount = new Set(
    speakers.map((s) => (s.country || "").trim()).filter(Boolean)
  ).size;

  // Filters
  const filteredBookings = bookings.filter((b) => {
    const matchesTab = activeTab === "all" || b.status === activeTab;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      b.name.toLowerCase().includes(searchLower) ||
      b.email.toLowerCase().includes(searchLower) ||
      b.phone.includes(searchLower) ||
      b.payment_id.toLowerCase().includes(searchLower) ||
      (b.organisation && b.organisation.toLowerCase().includes(searchLower)) ||
      (b.category && b.category.toLowerCase().includes(searchLower)) ||
      (b.type && b.type.toLowerCase().includes(searchLower)) ||
      (b.theme && b.theme.toLowerCase().includes(searchLower));

    return matchesTab && matchesSearch;
  });

  // Pagination calculation
  const totalFilteredCount = filteredBookings.length;
  const totalPages = Math.ceil(totalFilteredCount / ITEMS_PER_PAGE) || 1;
  
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page if filter contents change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeTab]);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <>
        {startPage > 1 && (
          <>
            <button className={styles.pageBtn} onClick={() => setCurrentPage(1)}>1</button>
            {startPage > 2 && <span className={styles.pageEllipsis}>...</span>}
          </>
        )}
        
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`}
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className={styles.pageEllipsis}>...</span>}
            <button className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
          </>
        )}
      </>
    );
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Header Bar */}
        <header className={styles.dashboardHeader}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.headerLogo}>
              MATCON <span>2026</span>
            </Link>
            <span className={styles.headerDivider}>|</span>
            <div className={styles.navViewSwitcher}>
              <button
                type="button"
                className={`${styles.viewSwitchBtn} ${mainView === "bookings" ? styles.viewSwitchBtnActive : ""}`}
                onClick={() => setMainView("bookings")}
              >
                <BookingsIcon />
                <span>Registrations</span>
                <span className={styles.viewBadge}>{bookings.length}</span>
              </button>
              <button
                type="button"
                className={`${styles.viewSwitchBtn} ${mainView === "speakers" ? styles.viewSwitchBtnActive : ""}`}
                onClick={() => setMainView("speakers")}
              >
                <SpeakerIcon />
                <span>Speakers</span>
                <span className={styles.viewBadge}>{speakers.length}</span>
              </button>
            </div>
            <span className={styles.dashboardBadge}>ADMIN DASHBOARD</span>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaTag}>// SECURE_SYSTEM</span>
            <button className={styles.headerLogoutBtn} onClick={handleLogout} title="Logout">
              <LogoutIcon />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Notifications Toast */}
        {notification && (
          <div className={`${styles.toast} ${styles[notification.type]}`} role="status">
            <span>{notification.message}</span>
          </div>
        )}

        <main className={styles.dashboardMain}>
          {/* ══════════════════════════════════════════════════════════
              VIEW 1: REGISTRATIONS MANAGEMENT
             ══════════════════════════════════════════════════════════ */}
          {mainView === "bookings" && (
            <>
              {/* Statistics Grid */}
              <section className={styles.statsGrid} aria-label="Quick Stats">
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total Registrations</span>
                  <span className={styles.statVal}>{totalCount}</span>
                  <div className={styles.statBar} style={{ width: "100%", background: "#a1a1aa" }} />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Pending Verification</span>
                  <span className={`${styles.statVal} ${styles.colorPending}`}>{pendingCount}</span>
                  <div 
                    className={styles.statBar} 
                    style={{ width: `${totalCount ? (pendingCount / totalCount) * 100 : 0}%`, background: "#f59e0b" }} 
                  />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Accepted & Confirmed</span>
                  <span className={`${styles.statVal} ${styles.colorAccept}`}>{acceptedCount}</span>
                  <div 
                    className={styles.statBar} 
                    style={{ width: `${totalCount ? (acceptedCount / totalCount) * 100 : 0}%`, background: "var(--accent, #c8f04a)" }} 
                  />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Rejected</span>
                  <span className={`${styles.statVal} ${styles.colorReject}`}>{rejectedCount}</span>
                  <div 
                    className={styles.statBar} 
                    style={{ width: `${totalCount ? (rejectedCount / totalCount) * 100 : 0}%`, background: "#ef4444" }} 
                  />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Food: Veg / Non-Veg</span>
                  <span className={styles.statValSub}>
                    <span>{vegCount} Veg</span>
                    <span className={styles.statValSep}>/</span>
                    <span>{nonVegCount} Non</span>
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Accommodation Needed</span>
                  <span className={styles.statValSub}>
                    <span>{accNeededCount} Yes</span>
                    <span className={styles.statValSep}>/</span>
                    <span>{totalCount - accNeededCount} No</span>
                  </span>
                </div>
              </section>

              {/* Database Connection Error View */}
              {fetchError && (
                <div className={styles.dbErrorCard}>
                  <h3>Supabase Connection/Table Issue</h3>
                  <p>{fetchError}</p>
                  <p className={styles.dbErrorTip}>
                    Please check if the `bookings` table has been created in your Supabase project. Use the schema script in <code>schema.sql</code>.
                  </p>
                </div>
              )}

              {/* Controls: Search, Tabs, and Export */}
              <section className={styles.controlsRow}>
                <div className={styles.searchBox}>
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search by Name, Email, Phone, Org, or Payment ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                  />
                  {search && (
                    <button className={styles.clearSearchBtn} onClick={() => setSearch("")} title="Clear search">
                      ✖
                    </button>
                  )}
                </div>

                <div className={styles.controlsActions}>
                  <div className={styles.tabsList} role="tablist">
                    {(["all", "pending", "accept", "reject"] as const).map((tab) => {
                      const label = tab === "all" ? "All" : tab === "accept" ? "Accepted" : tab === "reject" ? "Rejected" : "Pending";
                      const count = tab === "all" ? totalCount : tab === "pending" ? pendingCount : tab === "accept" ? acceptedCount : rejectedCount;
                      return (
                        <button
                          key={tab}
                          role="tab"
                          aria-selected={activeTab === tab}
                          onClick={() => setActiveTab(tab)}
                          className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
                        >
                          {label} <span className={styles.tabBadge}>{count}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Excel Export Button */}
                  <div className={styles.exportBtnGroup}>
                    <button
                      type="button"
                      className={styles.exportMainBtn}
                      onClick={() => handleExportExcel(false)}
                      title={`Export ${filteredBookings.length} ${activeTab === "all" ? "" : activeTab} registration(s) to Excel (.xlsx)`}
                    >
                      <ExcelIcon />
                      <span>Export Excel</span>
                      <span className={styles.exportCountBadge}>{filteredBookings.length}</span>
                    </button>
                    {filteredBookings.length !== bookings.length && (
                      <button
                        type="button"
                        className={styles.exportSecondaryBtn}
                        onClick={() => handleExportExcel(true)}
                        title={`Export all ${bookings.length} registration(s) without filtering`}
                      >
                        <span>All ({bookings.length})</span>
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* Bookings Table container */}
              <section className={styles.tableCard}>
                <div className={styles.tableScrollable}>
                  <table className={styles.bookingsTable}>
                    <thead>
                      <tr>
                        <th>Submission Date</th>
                        <th>Payment ID</th>
                        <th>Guest Details</th>
                        <th>Abstract</th>
                        <th>Presentation</th>
                        <th>Food & Acc.</th>
                        <th>Verification Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.length > 0 ? (
                        paginatedBookings.map((b) => (
                          <tr key={b.id} className={styles.bookingRow}>
                            <td className={styles.tdDate}>
                              {new Date(b.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className={styles.tdPayment}>
                              <code className={styles.paymentCode}>{b.payment_id}</code>
                            </td>
                            <td className={styles.tdGuest}>
                              <div className={styles.guestInfo}>
                                <span className={styles.guestName}>{b.name}</span>
                                {b.organisation && <span className={styles.guestOrg}>{b.organisation}</span>}
                                {b.category && <span className={styles.guestCategory}>{(b.category).replace(/_/g, ' ')}</span>}
                                <span className={styles.guestContact}>{b.email}</span>
                                <span className={styles.guestContact}>{b.phone}</span>
                              </div>
                            </td>
                            <td className={styles.tdAbstract}>
                              {b.abstract_url ? (
                                <a
                                  href={b.abstract_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.abstractLink}
                                >
                                  <FileIcon /> Download Abstract
                                </a>
                              ) : (
                                <span className={styles.noFile}>No File</span>
                              )}
                            </td>
                            <td className={styles.tdPresentation}>
                              <div className={styles.badgeCol}>
                                <span className={`${styles.badge} ${b.type === "oral" ? styles.badgeOral : styles.badgePoster}`}>
                                  {b.type ? (b.type.charAt(0).toUpperCase() + b.type.slice(1)) : "N/A"}
                                </span>
                                <span className={styles.themeText} title={b.theme}>
                                  {b.theme || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className={styles.tdBadges}>
                              <div className={styles.badgeCol}>
                                <span className={`${styles.badge} ${b.food_preference === "veg" ? styles.badgeVeg : styles.badgeNonVeg}`}>
                                  {b.food_preference === "veg" ? "Vegetarian" : "Non-Veg"}
                                </span>
                                <span className={`${styles.badge} ${b.accommodation_needed === "yes" ? styles.badgeAccYes : styles.badgeAccNo}`}>
                                  Accommodation: {b.accommodation_needed === "yes" ? "Yes" : "No"}
                                </span>
                              </div>
                            </td>
                            <td className={styles.tdStatus}>
                              <select
                                value={b.status}
                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                className={`${styles.statusDropdown} ${
                                  b.status === "accept"
                                    ? styles.selectAccept
                                    : b.status === "reject"
                                    ? styles.selectReject
                                    : styles.selectPending
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="accept">Accept</option>
                                <option value="reject">Reject</option>
                              </select>
                            </td>
                            <td className={styles.tdActions}>
                              <div className={styles.actionsCell}>
                                <button
                                  onClick={() => handleConfirmAndSend(b)}
                                  disabled={isPending}
                                  className={styles.sendTicketBtn}
                                  title="Confirm booking status & trigger ticket generation"
                                >
                                  {isPending && selectedTicketBooking?.id === b.id ? (
                                    <SpinnerIcon />
                                  ) : (
                                    <>
                                      <SendIcon /> Confirm & Send Ticket
                                    </>
                                  )}
                                </button>
                                {b.status === "accept" && (
                                  <button
                                    onClick={() => setSelectedTicketBooking(b)}
                                    className={styles.viewTicketBtn}
                                    title="Preview Registration Ticket"
                                  >
                                    <TicketIcon /> View Ticket
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className={styles.emptyCell}>
                            No registrations match your search filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Row */}
                {totalFilteredCount > 0 && (
                  <div className={styles.paginationRow}>
                    <div className={styles.paginationInfo}>
                      Showing <strong>{Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, totalFilteredCount)}</strong> to{" "}
                      <strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalFilteredCount)}</strong> of{" "}
                      <strong>{totalFilteredCount}</strong> bookings
                    </div>
                    <div className={styles.paginationBtns}>
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      {renderPageNumbers()}
                      <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              VIEW 2: SPEAKERS MANAGEMENT
             ══════════════════════════════════════════════════════════ */}
          {mainView === "speakers" && (
            <div>
              {/* Statistics Row */}
              <section className={styles.statsGrid} aria-label="Speaker Statistics">
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total Speakers</span>
                  <span className={styles.statVal}>{speakers.length}</span>
                  <div className={styles.statBar} style={{ width: "100%", background: "var(--accent, #c8f04a)" }} />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Institutions / Orgs</span>
                  <span className={styles.statVal}>{uniqueOrgsCount}</span>
                  <div className={styles.statBar} style={{ width: "100%", background: "#60a5fa" }} />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Countries Represented</span>
                  <span className={styles.statVal}>{uniqueCountriesCount}</span>
                  <div className={styles.statBar} style={{ width: "100%", background: "#f59e0b" }} />
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Filtered Match</span>
                  <span className={styles.statVal}>{filteredSpeakers.length}</span>
                  <div 
                    className={styles.statBar} 
                    style={{ width: `${speakers.length ? (filteredSpeakers.length / speakers.length) * 100 : 0}%`, background: "#a78bfa" }} 
                  />
                </div>
              </section>

              {/* Controls Bar: Search & Add Speaker */}
              <section className={styles.speakersControlsBar}>
                <div className={styles.speakersSearchWrap}>
                  <div className={styles.searchBox}>
                    <SearchIcon />
                    <input
                      type="text"
                      placeholder="Search speakers by Name, Designation, Department, Organization, Country..."
                      value={speakerSearch}
                      onChange={(e) => setSpeakerSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                    {speakerSearch && (
                      <button className={styles.clearSearchBtn} onClick={() => setSpeakerSearch("")} title="Clear search">
                        ✖
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.addSpeakerBtn}
                  onClick={openAddSpeakerModal}
                  title="Add a new distinguished speaker"
                >
                  <PlusIcon />
                  <span>Add Speaker</span>
                </button>
              </section>

              {/* Speakers Grid View */}
              {filteredSpeakers.length > 0 ? (
                <div className={styles.speakersGrid}>
                  {filteredSpeakers.map((speaker, idx) => {
                    const originalIndex = speakers.indexOf(speaker);
                    const org = speaker.organization || speaker.institution || "";
                    const imgUrl = speaker.image
                      ? (speaker.image.startsWith("http") || speaker.image.startsWith("/")
                          ? speaker.image
                          : `/speakers/${speaker.image}`)
                      : "/speakers/default.svg";

                    return (
                      <div key={idx} className={styles.speakerAdminCard}>
                        <div className={styles.speakerCardHeader}>
                          <div className={styles.speakerAvatarWrap}>
                            <img
                              src={imgUrl}
                              alt={speaker.name}
                              className={styles.speakerAvatarImg}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/speakers/default.svg";
                              }}
                            />
                          </div>
                          <div className={styles.speakerCardInfo}>
                            <span className={styles.speakerOrderBadge}>#{originalIndex + 1}</span>
                            <h3 className={styles.speakerCardName}>{speaker.name}</h3>
                            <p className={styles.speakerCardDesignation}>{speaker.designation}</p>
                            <div className={styles.speakerCardMeta}>
                              {speaker.department && (
                                <div className={styles.speakerCardDept} title="Department">
                                  <BuildingIcon />
                                  <span>{speaker.department}</span>
                                </div>
                              )}
                              {org && (
                                <div className={styles.speakerCardOrg} title="Organization / Institution">
                                  <BuildingIcon />
                                  <span>{org}</span>
                                </div>
                              )}
                              {speaker.country && (
                                <div className={styles.speakerCardCountry} title="Country">
                                  <MapPinIcon />
                                  <span>{speaker.country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={styles.speakerCardActions}>
                          <div className={styles.orderControls}>
                            <button
                              type="button"
                              className={styles.orderBtn}
                              onClick={() => handleMoveSpeaker(originalIndex, "up")}
                              disabled={originalIndex === 0}
                              title="Move Speaker Up in lineup"
                            >
                              <ArrowUpIcon />
                            </button>
                            <button
                              type="button"
                              className={styles.orderBtn}
                              onClick={() => handleMoveSpeaker(originalIndex, "down")}
                              disabled={originalIndex === speakers.length - 1}
                              title="Move Speaker Down in lineup"
                            >
                              <ArrowDownIcon />
                            </button>
                          </div>

                          <div className={styles.cardMainActions}>
                            <button
                              type="button"
                              className={styles.editSpeakerBtn}
                              onClick={() => openEditSpeakerModal(originalIndex)}
                              title="Edit speaker information"
                            >
                              <EditIcon />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className={styles.deleteSpeakerBtn}
                              onClick={() => setDeletingSpeakerIndex(originalIndex)}
                              title="Remove speaker"
                            >
                              <TrashIcon />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.tableCard} style={{ textAlign: "center", padding: "48px 24px" }}>
                  <p style={{ color: "#a1a1aa", fontSize: "1rem", margin: "0 0 16px 0" }}>
                    {speakerSearch
                      ? `No speakers match "${speakerSearch}".`
                      : "No speakers configured yet."}
                  </p>
                  <button
                    type="button"
                    className={styles.addSpeakerBtn}
                    onClick={openAddSpeakerModal}
                    style={{ margin: "0 auto" }}
                  >
                    <PlusIcon />
                    <span>Add First Speaker</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Speaker Modal */}
      {isSpeakerModalOpen && (
        <div className={styles.speakerModalOverlay} onClick={() => setIsSpeakerModalOpen(false)}>
          <div className={styles.speakerModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.speakerModalHeader}>
              <h2 className={styles.speakerModalTitle}>
                {editingSpeakerIndex !== null ? (
                  <>Edit Speaker <span>// #{editingSpeakerIndex + 1}</span></>
                ) : (
                  <>Add New Speaker <span>// LINEUP</span></>
                )}
              </h2>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsSpeakerModalOpen(false)}
                title="Close"
              >
                ✖
              </button>
            </div>

            <form onSubmit={handleSaveSpeaker}>
              <div className={styles.speakerModalBody}>
                <div className={styles.formGridTwoCol}>
                  <div className={`${styles.formField} ${styles.formFieldFull}`}>
                    <label className={styles.formLabelText}>
                      Full Name <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe"
                      value={speakerForm.name}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, name: e.target.value })}
                      className={styles.formTextInput}
                      autoFocus
                    />
                  </div>

                  <div className={`${styles.formField} ${styles.formFieldFull}`}>
                    <label className={styles.formLabelText}>
                      Designation <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Professor & Dean of Research"
                      value={speakerForm.designation}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, designation: e.target.value })}
                      className={styles.formTextInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabelText}>Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Department of Chemistry"
                      value={speakerForm.department}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, department: e.target.value })}
                      className={styles.formTextInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabelText}>
                      Organization / Institution <span>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cochin University of Science and Technology"
                      value={speakerForm.organization}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, organization: e.target.value })}
                      className={styles.formTextInput}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabelText}>Country</label>
                    <input
                      type="text"
                      placeholder="e.g. India"
                      value={speakerForm.country}
                      onChange={(e) => setSpeakerForm({ ...speakerForm, country: e.target.value })}
                      className={styles.formTextInput}
                    />
                  </div>

                  {/* Speaker Photo Upload (with automatic WebP conversion) */}
                  <div className={`${styles.formField} ${styles.formFieldFull}`}>
                    <label className={styles.formLabelText}>
                      Speaker Photo <span>(Auto-converted to .webp)</span>
                    </label>

                    {uploadedWebpData ? (
                      <div className={styles.imageUploadedPreviewWrap}>
                        <div className={styles.imageUploadedInfo}>
                          <div className={styles.imageUploadedThumb}>
                            <img src={uploadedWebpData} alt="Uploaded preview" />
                          </div>
                          <div>
                            <div className={styles.imageUploadedName}>
                              {speakerForm.name.trim()
                                ? `${speakerForm.name.replace(/[\/\\:*?"<>|]/g, "").trim()}.webp`
                                : uploadedFileName.replace(/\.[^/.]+$/, "") + ".webp"}
                            </div>
                            <span className={styles.imageConvertedBadge}>
                              ✓ Converted to .webp
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.imageClearBtn}
                          onClick={() => {
                            setUploadedWebpData(null);
                            setUploadedFileName("");
                          }}
                        >
                          Remove / Change
                        </button>
                      </div>
                    ) : (
                      <div>
                        <label
                          className={styles.imageUploadDropzone}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleImageFile(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleImageFile(e.target.files[0]);
                              }
                            }}
                            style={{ display: "none" }}
                          />
                          <div className={styles.imageUploadContent}>
                            <div className={styles.imageUploadIcon}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                            </div>
                            <div className={styles.imageUploadPrimaryText}>
                              {isConvertingImage ? (
                                <span>Converting image to WebP...</span>
                              ) : (
                                <><span>Click to browse</span> or drag image here</>
                              )}
                            </div>
                            <div className={styles.imageUploadSubText}>
                              Uploads will be converted to <strong>.webp</strong> and saved as <code>{speakerForm.name.trim() ? `${speakerForm.name.replace(/[\/\\:*?"<>|]/g, "").trim()}.webp` : "[Speaker Name].webp"}</code>
                            </div>
                          </div>
                        </label>
                      </div>
                    )}

                    {/* Fallback / Manual Image filename input */}
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="Or specify existing image (e.g. Dr. Jane Doe.webp)"
                        value={speakerForm.image}
                        onChange={(e) => setSpeakerForm({ ...speakerForm, image: e.target.value })}
                        className={styles.formTextInput}
                        style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Card Preview */}
                {(speakerForm.name || speakerForm.organization || uploadedWebpData || speakerForm.image) && (
                  <div>
                    <label className={styles.formLabelText} style={{ marginBottom: 6, display: "block" }}>
                      Live Preview
                    </label>
                    <div className={styles.speakerLivePreview}>
                      <div className={styles.previewThumb}>
                        <img
                          src={
                            uploadedWebpData
                              ? uploadedWebpData
                              : speakerForm.image
                              ? (speakerForm.image.startsWith("http") || speakerForm.image.startsWith("/")
                                  ? speakerForm.image
                                  : `/speakers/${speakerForm.image}`)
                              : "/speakers/default.svg"
                          }
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/speakers/default.svg";
                          }}
                        />
                      </div>
                      <div className={styles.previewInfo}>
                        <div className={styles.previewName}>{speakerForm.name || "Speaker Name"}</div>
                        <div className={styles.previewSub}>{speakerForm.designation || "Designation"}</div>
                        <div className={styles.previewOrg}>
                          {[speakerForm.department, speakerForm.organization, speakerForm.country]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.speakerModalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsSpeakerModalOpen(false)}
                  disabled={isSpeakerSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={isSpeakerSubmitting}
                >
                  {isSpeakerSubmitting ? (
                    <>
                      <SpinnerIcon /> Saving...
                    </>
                  ) : editingSpeakerIndex !== null ? (
                    "Update Speaker"
                  ) : (
                    "Add Speaker"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSpeakerIndex !== null && (
        <div className={styles.speakerModalOverlay} onClick={() => setDeletingSpeakerIndex(null)}>
          <div className={styles.deleteConfirmCard} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.deleteConfirmTitle}>
              <TrashIcon />
              <span>Remove Speaker</span>
            </h3>
            <p className={styles.deleteConfirmText}>
              Are you sure you want to remove{" "}
              <strong style={{ color: "#ffffff" }}>
                {speakers[deletingSpeakerIndex]?.name || "this speaker"}
              </strong>{" "}
              from MATCON 2026? This action will immediately remove the speaker from the conference website.
            </p>
            <div className={styles.deleteConfirmActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeletingSpeakerIndex(null)}
                disabled={isSpeakerSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleConfirmDeleteSpeaker}
                disabled={isSpeakerSubmitting}
              >
                {isSpeakerSubmitting ? "Removing..." : "Yes, Remove Speaker"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Preview Modal */}
      {selectedTicketBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTicketBooking(null)}>
          <div className={styles.ticketModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setSelectedTicketBooking(null)}>
              ✖
            </button>
            
            <div className={styles.ticketBadge}>MATCON 2026 ADMISSION TICKET</div>

            <div className={styles.ticketBody}>
              <div className={styles.ticketHeader}>
                <h2>MATCON 2026</h2>
                <p>International Conference on Materials for a Sustainable Future</p>
              </div>

              <div className={styles.ticketDivider} />

              <div className={styles.ticketMainInfo}>
                <div className={styles.ticketDetailsGrid}>
                  <div>
                    <span className={styles.tLabel}>Attendee Name</span>
                    <span className={styles.tVal}>{selectedTicketBooking.name}</span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Email</span>
                    <span className={styles.tVal}>{selectedTicketBooking.email}</span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Phone</span>
                    <span className={styles.tVal}>{selectedTicketBooking.phone}</span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Payment Reference</span>
                    <span className={styles.tVal}>{selectedTicketBooking.payment_id}</span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Presentation Type</span>
                    <span className={styles.tVal} style={{ textTransform: "capitalize" }}>
                      {selectedTicketBooking.type || "N/A"}
                    </span>
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span className={styles.tLabel}>Theme</span>
                    <span className={styles.tVal}>{selectedTicketBooking.theme || "N/A"}</span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Food Choice</span>
                    <span className={styles.tVal}>
                      {selectedTicketBooking.food_preference === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                    </span>
                  </div>
                  <div>
                    <span className={styles.tLabel}>Accommodation</span>
                    <span className={styles.tVal}>
                      {selectedTicketBooking.accommodation_needed === "yes" ? "Requested" : "Not Required"}
                    </span>
                  </div>
                </div>

                <div className={styles.ticketQrContainer}>
                  {ticketQrUrl ? (
                    <img src={ticketQrUrl} alt="Ticket Verification QR Code" className={styles.ticketQr} />
                  ) : (
                    <div className={styles.qrFallback}>Generating QR...</div>
                  )}
                  <span className={styles.qrLabel}>TICKET VERIFIED</span>
                </div>
              </div>

              <div className={styles.ticketFooter}>
                <p>Organized by the Department of Applied Chemistry, CUSAT</p>
                <div className={styles.ticketBarcodes}>
                  <div className={styles.barcodeLine} />
                  <div className={styles.barcodeLine} />
                  <div className={styles.barcodeLine} />
                  <div className={styles.barcodeLine} />
                  <div className={styles.barcodeLine} />
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                onClick={() => window.print()} 
                className={styles.printBtn}
              >
                Print Ticket
              </button>
              <button 
                onClick={() => setSelectedTicketBooking(null)} 
                className={styles.closeBtn}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Icons
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BookingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#a1a1aa" }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const SendIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const TicketIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className={styles.spinner} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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

const ExcelIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="22" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="9" y1="6" x2="9" y2="6.01" />
    <line x1="15" y1="6" x2="15" y2="6.01" />
    <line x1="9" y1="10" x2="9" y2="10.01" />
    <line x1="15" y1="10" x2="15" y2="10.01" />
    <line x1="9" y1="14" x2="9" y2="14.01" />
    <line x1="15" y1="14" x2="15" y2="14.01" />
    <line x1="9" y1="18" x2="9" y2="18.01" />
    <line x1="15" y1="18" x2="15" y2="18.01" />
  </svg>
);
