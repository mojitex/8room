import { NextResponse } from "next/server";
import { pingModelByKind } from "./ping";
import { resolveProviderId } from "@/shared/constants/providers.js";

// POST /api/models/test - Ping a single model via internal completions or embeddings
export async function POST(request) {
  try {
    const { model, kind } = await request.json();
    if (!model) return NextResponse.json({ error: "Model required" }, { status: 400 });

    // OpenCode Free does not support third-party dashboard probes. Never send a
    // synthetic prompt from this endpoint; report the probe as intentionally skipped.
    const providerId = resolveProviderId(String(model).split("/")[0]);
    if (providerId === "opencode") {
      return NextResponse.json({
        ok: false,
        skipped: true,
        error: "OpenCode Free model probes are disabled. A skipped probe does not indicate that the profile is invalid.",
      });
    }

    const result = await pingModelByKind(model, kind || "llm");
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
