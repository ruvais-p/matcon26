import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, paymentData } = body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    // 1. Verify Payment Signature
    const secret = process.env.TEST_KEY_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // 2. Map Frontend Data to Database Enums
    const titleMap: Record<string, string> = {
      "Prof.": "PROF",
      "Dr.": "DR",
      "Ms.": "MS",
      "Mr.": "MR",
    };

    const designationMap: Record<string, string> = {
      "student": "STUDENT",
      "research_scholar_/_fellow": "RESEARCH_FELLOW",
      "faculty": "FACULTY",
      "industry": "INDUSTRY",
    };

    const participationMap: Record<string, string> = {
      "participation_only": "PARTICIPATION_ONLY",
      "poster_oral": "POSTER_OR_ORAL",
      "lecture": "LECTURE",
    };

    const dbProfile = {
      title: titleMap[formData.title] || "MR",
      full_name: formData.name,
      designation: designationMap[formData.designation] || "STUDENT",
      nationality: formData.nationality.toUpperCase(),
      organization_name: formData.organization,
      email: formData.email,
      contact_number: formData.contact,
      participation_type: participationMap[formData.participationType] || "PARTICIPATION_ONLY",
      accommodation_required: formData.accommodation === "yes",
      food_preference: formData.foodPreference.toUpperCase(),
    };

    // 3. Insert into profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([dbProfile])
      .select()
      .single();

    if (profileError) {
      console.error("Profile insertion error:", profileError);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    // 4. Insert into presentations table if applicable
    if (formData.participationType === "poster_oral") {
      await supabaseAdmin.from("presentations").insert([
        {
          profile_id: profile.id,
          title_of_abstract: formData.abstractTitle,
          abstract_link: formData.abstractLink,
          presentation_type: "POSTER",
        },
      ]);
    }

    // 5. Generate QR Code
    const qrContent = `
Name: ${dbProfile.title} ${dbProfile.full_name}
Designation: ${dbProfile.designation}
Nationality: ${dbProfile.nationality}
Organization: ${dbProfile.organization_name}
Participation: ${dbProfile.participation_type}
Food: ${dbProfile.food_preference}
`.trim();

    const qrBuffer = await QRCode.toBuffer(qrContent);

    // 6. Upload to Supabase Storage
    const fileName = `qr_${profile.id}.png`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("tickets")
      .upload(fileName, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ 
        error: "Failed to upload ticket QR code", 
        details: uploadError.message 
      }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from("tickets").getPublicUrl(fileName);
    const qrLink = publicUrlData.publicUrl;

    // 7. Create Ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from("tickets")
      .insert([
        {
          profile_id: profile.id,
          qr_link: qrLink,
        },
      ])
      .select()
      .single();

    if (ticketError) {
      console.error("Ticket insertion error:", ticketError);
    }

    return NextResponse.json({ success: true, profileId: profile.id, qrLink });
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
