import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    const groq = new Groq({
      apiKey: apiKey,
    });

    console.log("Sending message to Groq...");

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are Schedula AI Care Assistant.

Schedula is a healthcare appointment and management platform.

Help users with:
- Booking appointments
- Finding doctors
- Understanding appointments
- Patient dashboard
- Doctor dashboard
- Schedula features
- General healthcare information
- General wellness questions
- Medical terminology

You are an AI assistant, not a doctor.

Never:
- Diagnose a disease
- Prescribe medication
- Tell users to start or stop medication
- Give dangerous medical instructions
- Claim to have access to private medical records

For serious symptoms, recommend speaking with a qualified healthcare professional.

For emergencies such as severe chest pain, difficulty breathing,
unconsciousness, severe bleeding, stroke symptoms, seizures,
or serious injuries, tell the user to seek emergency medical care
immediately.

For emergencies in India, tell the user to call 112 or visit
the nearest emergency department.

Keep your answers:
- Friendly
- Clear
- Concise
- Easy to understand
`,
        },
        {
          role: "user",
          content: message,
        },
      ],

      temperature: 0.3,
      max_tokens: 500,
    });

    const reply = completion.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        {
          error: "Groq returned an empty response.",
        },
        { status: 500 }
      );
    }

    console.log("Groq response received successfully.");

    return NextResponse.json({
      reply,
    });
  } catch (error: any) {
    console.error("GROQ ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.error?.message ||
          error?.message ||
          "Groq API request failed.",
      },
      { status: 500 }
    );
  }
}