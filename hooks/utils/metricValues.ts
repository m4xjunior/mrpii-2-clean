/**
 * Normaliza valores numéricos vindos dos webhooks do N8N.
 * A API pode enviar números, strings com vírgula decimal ou com sufixo '%'.
 */
export function normalizeMetricValue(raw: unknown): number {
  if (raw === null || raw === undefined) {
    return 0;
  }

  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : 0;
  }

  if (typeof raw === 'string') {
    const cleaned = raw
      .replace(/%/g, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim();

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Alguns webhooks podem trazer valores aninhados (ex: { value: "85,3" })
  if (typeof raw === 'object' && 'value' in (raw as Record<string, unknown>)) {
    return normalizeMetricValue((raw as Record<string, unknown>).value);
  }

  return 0;
}
