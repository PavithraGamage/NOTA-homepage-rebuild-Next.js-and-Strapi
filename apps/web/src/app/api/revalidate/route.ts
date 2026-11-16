import { revalidateTag } from 'next/cache';
import { isBearerAuthorized } from '@/lib/auth/bearer';
import { getServerEnv } from '@/lib/env';
import { tagsForWebhook, webhookPayloadSchema } from '@/lib/strapi/tags';

/**
 * Strapi webhook target (see apps/cms/src/bootstrap/revalidate-webhook.ts).
 * Reached over Railway's private network; the bearer secret is the authentication.
 */
export async function POST(request: Request) {
  if (!isBearerAuthorized(request.headers.get('authorization'), getServerEnv().REVALIDATE_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = webhookPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  const tags = tagsForWebhook(parsed.data);
  // { expire: 0 } = no stale window: the next page request blocks on fresh data, so the
  // first refresh after publishing already shows the change (the 'max' profile would serve
  // one stale response first).
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  console.info(`[revalidate] ${parsed.data.event} ${parsed.data.uid ?? ''} → ${tags.join(', ') || 'nothing'}`);
  return Response.json({ revalidated: tags.length > 0, tags, event: parsed.data.event });
}
