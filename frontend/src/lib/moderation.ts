export type ModerationResult = {
  allowed: boolean;
  reasons?: string[];
};

/**
 * Placeholder helper to connect Azure AI Content Safety.
 * Replace fetch logic with a call to your protected API or Azure Function.
 */
export async function moderateContent(payload: { text: string; authorId: string }): Promise<ModerationResult> {
  try {
    // TODO: POST to /api/moderation or Azure Function using Content Safety SDK.
    // const response = await fetch('/api/moderation', { method: 'POST', body: JSON.stringify(payload) })
    // return response.json();
    await new Promise(resolve => setTimeout(resolve, 50));
    return { allowed: true };
  } catch (error) {
    console.warn('Moderation fallback, allow with review', error);
    return { allowed: true, reasons: ['fallback'] };
  }
}
