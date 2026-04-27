import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.TEST_KEY_ID as string,
  key_secret: process.env.TEST_KEY_SECRET as string,
});

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    const options = {
      amount: amount, // amount in the smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay error:", error);
    return NextResponse.json({ error: "Error creating order" }, { status: 500 });
  }
}
