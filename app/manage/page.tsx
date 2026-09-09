import { checkAdminSession, fetchAllBookings, fetchSpeakers } from "./actions";
import AdminLogin from "./Login";
import AdminDashboard from "./Dashboard";

export default async function ManagePage() {
  const isAuthenticated = await checkAdminSession();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const [bookingsResult, speakersResult] = await Promise.all([
    fetchAllBookings(),
    fetchSpeakers(),
  ]);

  const bookings = bookingsResult.success ? bookingsResult.data || [] : [];
  const fetchError = bookingsResult.success ? null : (bookingsResult.error ?? "Failed to fetch bookings.");
  const speakers = speakersResult.success ? speakersResult.data || [] : [];

  return (
    <AdminDashboard
      initialBookings={bookings}
      fetchError={fetchError}
      initialSpeakers={speakers}
    />
  );
}
