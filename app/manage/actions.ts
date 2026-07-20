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
import crypto from "crypto";

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

    // Encrypt QR data so only admin can decrypt it
    const secretKey = process.env.ADMIN_PASS || "matcon2026_default_secret";
    const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32); 
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encryptedData = cipher.update(qrData, "utf8", "hex");
    encryptedData += cipher.final("hex");
    const finalQrData = iv.toString('hex') + ":" + encryptedData;

    const qrCodeDataUrl = await QRCode.toDataURL(finalQrData, { width: 300, margin: 2, color: { dark: "#000000", light: "#ffffff" } });

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
      subject: "Your Official Ticket for MATCON 2026 🎟️",
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; background-color: #020e04; color: #f2f2f2; max-width: 650px; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #c8f04a33; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #020e04 0%, #0a1f0d 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #c8f04a;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">MATCON <span style="color: #c8f04a;">2026</span></h1>
            <p style="margin: 10px 0 0; font-size: 16px; color: #a1a1aa; letter-spacing: 1px;">INTERNATIONAL CONFERENCE</p>
            <p style="margin: 5px 0 0; font-size: 13px; color: #c8f04a; font-weight: bold; text-transform: uppercase;">Materials for a Sustainable Future</p>
          </div>
          
          <!-- Body -->
          <div style="padding: 40px 30px; background-color: #051408;">
            <h2 style="color: #c8f04a; font-size: 22px; margin-top: 0; font-weight: 700;">Registration Confirmed!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Dear <strong>${booking.name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #d4d4d8;">Your registration for MATCON 2026 has been successfully verified. We are thrilled to welcome you to the conference.</p>
            <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa;">Registered Email: <span style="color: #ffffff;">${booking.email}</span><br/>Registered Phone: <span style="color: #ffffff;">${booking.phone || "N/A"}</span></p>
            
            <!-- Ticket Details Card -->
            <div style="margin: 30px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 20px;">
              <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 15px; font-size: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Attendee Information</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 15px; table-layout: fixed;">
                <tr><td style="padding: 10px 0; color: #a1a1aa; width: 40%;">Payment Ref</td><td style="padding: 10px 0; text-align: right; color: #ffffff; font-family: monospace; word-break: break-all;">${booking.payment_id}</td></tr>
                <tr><td style="padding: 10px 0; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05);">Type</td><td style="padding: 10px 0; text-align: right; color: #ffffff; text-transform: capitalize; border-top: 1px solid rgba(255,255,255,0.05); word-break: break-word;">${booking.type || "N/A"}</td></tr>
                <tr><td style="padding: 10px 0; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05);">Theme</td><td style="padding: 10px 0; text-align: right; color: #ffffff; border-top: 1px solid rgba(255,255,255,0.05); word-break: break-word;">${booking.theme || "N/A"}</td></tr>
                <tr><td style="padding: 10px 0; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05);">Food</td><td style="padding: 10px 0; text-align: right; color: #ffffff; border-top: 1px solid rgba(255,255,255,0.05); word-break: break-word;">${booking.food_preference === "veg" ? "Vegetarian" : "Non-Vegetarian"}</td></tr>
                <tr><td style="padding: 10px 0; color: #a1a1aa; border-top: 1px solid rgba(255,255,255,0.05);">Accommodation</td><td style="padding: 10px 0; text-align: right; color: #ffffff; border-top: 1px solid rgba(255,255,255,0.05); word-break: break-word;">${booking.accommodation_needed === "yes" ? "Requested" : "Not Required"}</td></tr>
              </table>
            </div>

            <!-- QR Code Section -->
            <div style="text-align: center; margin: 40px 0;">
              <p style="font-size: 14px; color: #a1a1aa; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">Secure Access QR Code</p>
              <div style="display: inline-block; background: #ffffff; padding: 15px; border-radius: 8px;">
                <img src="cid:ticket_qr" alt="Ticket QR Code" style="display: block; width: 220px; height: 220px;" />
              </div>
              <p style="font-size: 13px; color: #666; margin-top: 15px;">Please present this QR code at the registration desk.</p>
            </div>
            
            <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8; text-align: center;">We look forward to your participation and contribution to a sustainable future.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #020e04; padding: 30px 20px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid rgba(255,255,255,0.05);">
            <h4 style="color: #a1a1aa; font-size: 14px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Get in Touch</h4>
            <p style="margin: 0 0 4px 0; color: #d4d4d8;">Department of Applied Chemistry</p>
            <p style="margin: 0 0 4px 0;">Cochin University of Science and Technology</p>
            <p style="margin: 0 0 15px 0;">Kochi, Kerala, India - 682 022</p>
            <p style="margin: 0 0 4px 0;"><a href="mailto:matcon2026@cusat.ac.in" style="color: #c8f04a; text-decoration: none;">matcon2026@cusat.ac.in</a></p>
            <p style="margin: 0 0 25px 0;"><a href="tel:+914842575804" style="color: #c8f04a; text-decoration: none;">+91 484 257 5804</a></p>
            <div style="border-top: 1px solid rgba(255,255,255,0.05); margin: 0 40px 15px 40px; padding-top: 15px;">
              <p style="margin: 0 0 5px 0;">© 2026 Department of Applied Chemistry, CUSAT</p>
              <p style="margin: 0; color: #555;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
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
