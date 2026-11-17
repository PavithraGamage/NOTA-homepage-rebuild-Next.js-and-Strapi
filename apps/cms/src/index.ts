import type { Core } from '@strapi/strapi';
import { provisionRevalidateWebhook } from './bootstrap/revalidate-webhook';
import { applyEditorCopy } from './editor-ux/apply';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await provisionRevalidateWebhook(strapi);
    await applyEditorCopy(strapi);
  },
};
