"use client";

import { useState, useTransition, useEffect } from "react";
import { updateBookingStatus, confirmAndSendTicket, logoutAdmin } from "./actions";
import styles from "./manage.module.css";
import Link from "next/link";
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
};

export default function AdminDashboard({ initialBookings, fetchError }: DashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "accept" | "reject">("all");
  const [selectedTicketBooking, setSelectedTicketBooking] = useState<Booking | null>(null);
  const [ticketQrUrl, setTicketQrUrl] = useState<string>("");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;

  const [isPending, startTransition] = useTransition();

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
            <span className={styles.dashboardTitle}>Bookings Management</span>
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
        </main>


      </div>

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
