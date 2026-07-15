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

import nodemailer from "nodemailer";
import QRCode from "qrcode";

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

  try {
    const qrData = JSON.stringify({
      bookingId: booking.id,
      name: booking.name,
      paymentId: booking.payment_id,
      email: booking.email,
      type: booking.type || "",
      theme: booking.theme || "",
      food: booking.food_preference,
      accommodation: booking.accommodation_needed,
      event: "MATCON 2026"
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 300, margin: 2, color: { dark: "#020e04", light: "#ffffff" } });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"MATCON 2026" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: "Registration Confirmed - MATCON 2026 Ticket",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #020e04; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">MATCON 2026</h1>
            <p style="margin: 5px 0 0; font-size: 14px;">Admission Ticket</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #4CAF50; font-size: 20px; margin-top: 0;">Registration Confirmed!</h2>
            <p>Dear <strong>${booking.name}</strong>,</p>
            <p>Your registration for MATCON 2026 has been successfully verified and confirmed.</p>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Payment Reference:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.payment_id}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Presentation Type:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; text-transform: capitalize;">${booking.type || "N/A"}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Theme:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.theme || "N/A"}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Food Choice:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.food_preference === "veg" ? "Vegetarian" : "Non-Vegetarian"}</td></tr>
              <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Accommodation:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${booking.accommodation_needed === "yes" ? "Requested" : "Not Required"}</td></tr>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Please present this QR code at the event check-in</p>
              <img src="cid:ticket_qr" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 1px solid #ccc; padding: 10px; border-radius: 8px;" />
            </div>
            
            <p style="font-size: 14px; color: #666;">We look forward to seeing you at the conference.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            © 2026 Department of Applied Chemistry, CUSAT
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'ticket-qr.png',
          path: qrCodeDataUrl,
          cid: 'ticket_qr'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log(`[TICKET SENT] Booking ${id} confirmed. Email sent to ${booking.email}`);

  } catch (mailError: any) {
    console.error("Mail sending failed:", mailError);
    return {
      success: false,
      message: "Ticket confirmed but failed to send email: " + mailError.message,
    };
  }

  return {
    success: true,
    message: `Ticket confirmed and registration ticket successfully dispatched to ${booking.email}.`,
  };
}
