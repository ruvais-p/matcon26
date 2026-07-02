import { checkAdminSession, fetchAllBookings } from "./actions";
import AdminLogin from "./Login";
import AdminDashboard from "./Dashboard";

export default async function ManagePage() {
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const result = await fetchAllBookings();
  const bookings = result.success ? result.data || [] : [];
  const fetchError = result.success ? null : (result.error ?? "Failed to fetch bookings.");

  return <AdminDashboard initialBookings={bookings} fetchError={fetchError} />;
}
