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
 * Uploads go to S3-compatible object storage when a bucket is set (Render's free plan has no
 * persistent disk, so local files would vanish on every restart), and to public/uploads otherwise.
 * Written for Neon Object Storage; the same settings work for Cloudflare R2 or AWS S3.
 */
const s3Provider = (env: Core.Config.Shared.ConfigParams['env']) =>
  env('S3_BUCKET')
    ? {
        provider: 'aws-s3',
        providerOptions: {
          // Public address of the bucket (endpoint + /bucket for path-style stores), so file URLs
          // don't depend on how each store reports an upload's location.
          baseUrl: env('S3_PUBLIC_URL'),
          rootPath: env('S3_ROOT_PATH', 'nota'),
          s3Options: {
            endpoint: env('S3_ENDPOINT'),
            region: env('S3_REGION'),
            // Neon (and most S3-compatible stores) only support path-style addressing.
            forcePathStyle: true,
            credentials: {
              accessKeyId: env('S3_ACCESS_KEY_ID'),
              secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
            },
            // Only send checksums when an operation requires them; newer AWS SDK defaults
            // aren't supported by every S3-compatible store.
            requestChecksumCalculation: 'WHEN_REQUIRED',
            responseChecksumValidation: 'WHEN_REQUIRED',
            params: {
              Bucket: env('S3_BUCKET'),
              // Present but undefined: the provider would otherwise send `public-read`, which Neon
              // rejects with 501. Public access is a property of the bucket instead.
              ACL: undefined,
            },
          },
        },
        actionOptions: { upload: {}, uploadStream: {}, delete: {} },
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
      ...s3Provider(env),
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes,
      },
    },
  },
});

export default config;
