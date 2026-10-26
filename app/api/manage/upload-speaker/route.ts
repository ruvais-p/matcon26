import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (session?.value !== "authenticated") {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const speakerName = (formData.get("speakerName") as string) || "speaker";

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    const sanitizedBase = speakerName
      .replace(/[\/\\:*?"<>|]/g, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const fileName = `${sanitizedBase || "speaker"}_${Date.now()}.webp`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from("speakers")
      .upload(fileName, buffer, {
        contentType: "image/webp",
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("speakers")
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error("Error in upload-speaker route:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
