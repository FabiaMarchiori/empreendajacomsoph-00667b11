type TechnicalDetails = {
  request_id?: string;
  user_id?: string;
  subscription_id?: string;
  communication_id?: string;
  http_status?: number;
  code?: unknown;
  count?: number;
  chars?: number;
};
export function safeErrorCode(error: unknown): string {
  const code =
    typeof error === "object" && error !== null
      ? (error as { code?: unknown }).code
      : error;
  if (
    typeof code === "string" &&
    (/^[0-9A-Z]{5}$/.test(code) || /^PGRST\d{3}$/.test(code))
  )
    return code;
  return "UNSPECIFIED";
}
export function technicalId(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value)
    ? value
    : undefined;
}
// Allowlisted fields only: never pass error.message, request bodies, emails or provider replies.
export function logEvent(
  level: "info" | "warn" | "error",
  event: string,
  details: TechnicalDetails = {},
) {
  const entry: Record<string, unknown> = { event, level };
  for (const field of [
    "request_id",
    "user_id",
    "subscription_id",
    "communication_id",
  ] as const) {
    const value = technicalId(details[field]);
    if (value) entry[field] = value;
  }
  if (details.code !== undefined) entry.code = safeErrorCode(details.code);
  for (const field of ["http_status", "count", "chars"] as const) {
    const value = details[field];
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
      entry[field] = value;
  }
  console[level === "info" ? "log" : level](JSON.stringify(entry));
}

type JsonObject = Record<string, unknown>;
function object(v: unknown): JsonObject {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as JsonObject)
    : {};
}
const safeLabel = (v: unknown) =>
  typeof v === "string" && /^[a-zA-Z0-9_.-]{1,64}$/.test(v) ? v : undefined;
const instant = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}[T ][\d:.Z+ -]{5,40}$/.test(v)
    ? v
    : undefined;
const compact = (v: JsonObject) =>
  Object.fromEntries(
    Object.entries(v).filter(([, value]) => value !== undefined),
  );
// New audit writes only. Historical rows and webhook_logs schema are never touched.
// Keep contract/order/charge evidence for reconciliation, not customer identity or login URLs.
export function technicalWebhookPayload(value: unknown): JsonObject {
  const p = object(value),
    sub = object(p.Subscription),
    access = object(sub.customer_access);
  const charges = object(sub.charges),
    product = object(p.Product),
    customer = object(p.Customer);
  const entry: JsonObject = {};
  for (const k of ["order_id", "subscription_id"] as const)
    if (technicalId(p[k])) entry[k] = technicalId(p[k]);
  for (const k of [
    "event",
    "webhook_event_type",
    "order_status",
    "payment_method",
    "product_type",
  ] as const)
    if (safeLabel(p[k])) entry[k] = safeLabel(p[k]);
  for (const k of [
    "created_at",
    "updated_at",
    "approved_date",
    "refunded_at",
  ] as const)
    if (instant(p[k])) entry[k] = instant(p[k]);
  if (typeof p.receivedToken === "boolean")
    entry.receivedToken = p.receivedToken;
  if (p.Transaction)
    entry.Transaction = compact({
      order_id: technicalId(object(p.Transaction).order_id),
    });
  if (p.Customer) entry.Customer = compact({ id: technicalId(customer.id) });
  if (p.Product)
    entry.Product = compact({
      id: technicalId(product.id),
      product_id: technicalId(product.product_id),
      product_offer_id: technicalId(product.product_offer_id),
    });
  if (p.Subscription)
    entry.Subscription = compact({
      id: technicalId(sub.id),
      status: safeLabel(sub.status),
      start_date: instant(sub.start_date),
      next_payment: instant(sub.next_payment),
      customer_access: compact({
        has_access:
          typeof access.has_access === "boolean"
            ? access.has_access
            : undefined,
        active_period:
          typeof access.active_period === "boolean"
            ? access.active_period
            : undefined,
        access_until: instant(access.access_until),
      }),
      charges: {
        completed: Array.isArray(charges.completed)
          ? charges.completed.map((c) => {
              const charge = object(c);
              return compact({
                order_id: technicalId(charge.order_id),
                status: safeLabel(charge.status),
                created_at: instant(charge.created_at),
              });
            })
          : [],
      },
    });
  return entry;
}
