export function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
    "X-GrainMuse-Function-Version": "2026-08-15.1",
    "X-Content-Type-Options": "nosniff",
  };
}

export function preflightResponse(origin) {
  // Supabase's Edge Runtime expects an ordinary successful response here.
  // A bodyless 204 can throw in some runtime versions when representation
  // headers such as Content-Type are present.
  return Response.json({ ok: true }, {
    status: 200,
    headers: corsHeaders(origin),
  });
}
