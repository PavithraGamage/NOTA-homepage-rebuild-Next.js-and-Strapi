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

/**
 * Uploads go to Cloudinary when its credentials are set (Render's free plan has no persistent
 * disk, so local files would vanish on every restart), and to public/uploads otherwise.
 */
const cloudinaryProvider = (env: Core.Config.Shared.ConfigParams['env']) =>
  env('CLOUDINARY_NAME')
    ? {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: env('CLOUDINARY_NAME'),
          api_key: env('CLOUDINARY_KEY'),
          api_secret: env('CLOUDINARY_SECRET'),
        },
        actionOptions: {
          // One folder per site, so the account can hold other projects too.
          upload: { folder: env('CLOUDINARY_FOLDER', 'nota') },
          uploadStream: { folder: env('CLOUDINARY_FOLDER', 'nota') },
          delete: {},
        },
      }
    : {};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
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
      ...cloudinaryProvider(env),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
