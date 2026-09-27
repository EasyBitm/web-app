import { NextResponse } from "next/server";
import { FEEDBACK_TYPES, MAX_FEEDBACK_LENGTH } from "../../../src/lib/feedback";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const { type, message, email, page, website } = await request.json();

    // Hidden "website" field: real users never fill it, bots usually do.
    if (website) {
      return NextResponse.json({ message: "Feedback sent" });
    }

    const text = typeof message === "string" ? message.trim() : "";
    const replyTo = typeof email === "string" ? email.trim() : "";
    const feedbackType = FEEDBACK_TYPES.includes(type) ? type : "Other";

    if (!text) {
      return NextResponse.json({ error: "Please write your feedback" }, { status: 400 });
    }
    if (text.length > MAX_FEEDBACK_LENGTH) {
      return NextResponse.json(
        { error: `Please keep feedback under ${MAX_FEEDBACK_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (!replyTo) {
      return NextResponse.json({ error: "Please enter your email" }, { status: 400 });
    }
    if (replyTo.length > 254 || !EMAIL_PATTERN.test(replyTo)) {
      return NextResponse.json({ error: "That email address doesn't look right" }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Feedback error: RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Feedback isn't set up yet. Please email easybitm@gmail.com" },
        { status: 503 }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.FEEDBACK_FROM_EMAIL ?? "easyBITM Feedback <onboarding@resend.dev>",
        to: process.env.FEEDBACK_TO_EMAIL ?? "easybitm@gmail.com",
        reply_to: replyTo,
        subject: `[easyBITM] ${feedbackType}: ${text.slice(0, 60).replace(/\s+/g, " ")}`,
        text: [
          text,
          "",
          "---",
          `Type: ${feedbackType}`,
          `From: ${replyTo}`,
          `Page: ${typeof page === "string" ? page.slice(0, 500) : "unknown"}`,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      console.error("Feedback error: Resend responded", res.status, await res.text());
      return NextResponse.json(
        { error: "Couldn't send your feedback. Please try again" },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: "Feedback sent" });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
