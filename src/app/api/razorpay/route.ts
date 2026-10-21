import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency = "INR", receipt, notes } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount specified" },
        { status: 400 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const isPlaceholderKey =
      !keyId ||
      !keySecret ||
      keyId.includes("your_razorpay") ||
      keySecret.includes("your_razorpay");

    // If Razorpay API credentials are not yet configured or placeholder,
    // generate a graceful demo transaction order so the checkout completes smoothly
    if (isPlaceholderKey) {
      const demoOrderId = `order_zuriq_${Date.now()}_${Math.random()
        .toString(36)
        .substring(4, 9)}`;

      return NextResponse.json({
        id: demoOrderId,
        amount: Math.round(amount * 100), // amount in paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: "created",
        isDemoMode: true,
        key: keyId || "rzp_test_demo",
      });
    }

    // Call official Razorpay Orders API
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {},
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Razorpay API error:", data);
      return NextResponse.json(
        { error: data.error?.description || "Failed to initialize Razorpay order" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ...data,
      isDemoMode: false,
      key: keyId,
    });
  } catch (error: any) {
    console.error("Razorpay endpoint exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
