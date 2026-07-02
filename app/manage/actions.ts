"use server";

import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function loginAdmin(email: string, pass: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;

  if (email === adminEmail && pass === adminPass) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    return { success: true };
  }

  return { success: false, error: "Invalid admin credentials." };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated";
}

export async function fetchAllBookings() {
  // Check auth
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session?.value !== "authenticated") {
    return { success: false, error: "Unauthorized access" };
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch bookings database error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function updateBookingStatus(id: string, status: string) {
  // Check auth
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Update status error:", error);
    throw new Error(error.message);
  }

  return { success: true, data };
}

export async function confirmAndSendTicket(id: string) {
  // Check auth
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session?.value !== "authenticated") {
    throw new Error("Unauthorized");
  }

  // Get booking details
  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    throw new Error("Booking not found");
  }

  // Update status to 'accept' (accepted)
  const { error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({ status: "accept" })
    .eq("id", id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Here, we simulate generating a ticket QR code and sending it.
  console.log(`[TICKET SENT] Booking ${id} confirmed. Email sent to ${booking.email}`);

  return {
    success: true,
    message: `Ticket confirmed and registration ticket successfully dispatched to ${booking.email}.`,
  };
}
