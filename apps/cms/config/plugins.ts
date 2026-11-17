import type { Core } from '@strapi/strapi';

/**
 * Only the media this site uses: images (incl. SVG logos), videos, and JSON for the hero's
 * Lottie image sequence. SVG is allowed because uploads are served with a sandboxing
 * Content-Security-Policy (src/middlewares/upload-headers.ts), so a script inside an SVG
 * cannot run even if the file is opened directly.
 */
const allowedMediaTypes = ['image/*', 'video/mp4', 'video/webm', 'application/json'];

const deniedTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = (): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  upload: {
    config: {
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
