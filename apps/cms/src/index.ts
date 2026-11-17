import type { Core } from '@strapi/strapi';
import { lockPublicRole } from './bootstrap/lock-public-role';
import { provisionRevalidateWebhook } from './bootstrap/revalidate-webhook';
import { applyEditorCopy } from './editor-ux/apply';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await lockPublicRole(strapi);
    await provisionRevalidateWebhook(strapi);
    await applyEditorCopy(strapi);
  },
};
