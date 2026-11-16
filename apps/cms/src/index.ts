import type { Core } from '@strapi/strapi';
import { provisionRevalidateWebhook } from './bootstrap/revalidate-webhook';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await provisionRevalidateWebhook(strapi);
  },
};
