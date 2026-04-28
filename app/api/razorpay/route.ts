import { NextResponse } from "next/server";
import Razorpay from "razorpay";

import { getRegistrationFee } from "@/lib/fees";

const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY_ID as string,
  key_secret: process.env.TEST_KEY_SECRET as string,
});

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();
    
    const { amount, currency } = getRegistrationFee({
      category: formData.designation,
      nationality: formData.nationality,
      participationType: formData.participationType,
    });

    // Razorpay amount is in paise/cents
    const razorpayAmount = currency === "INR" ? amount * 100 : amount * 100;

    const options = {
      amount: razorpayAmount,
      currency: currency,
      receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, displayAmount: amount, displayCurrency: currency });
  } catch (error) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}
