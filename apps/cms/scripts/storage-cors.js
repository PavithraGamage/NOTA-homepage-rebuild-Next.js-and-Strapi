/**
 * Lets the website's origins read the upload bucket from the browser (CORS), then prints the rules:
 *
 *   npm run storage:cors
 *
 * Needed because the site draws the wordmark as a CSS mask and fetches the hero sequence with
 * fetch(); browsers make both requests in CORS mode. Uses the same S3_* variables as the upload
 * provider (config/plugins.ts) and allows the origins in CORS_ORIGINS. Export them in the shell
 * first; this script doesn't read .env, so it can't pick up local values by mistake.
 */
const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require('@aws-sdk/client-s3');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required (see apps/cms/.env.example).`);
  return value;
}

async function main() {
  const origins = required('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const bucket = required('S3_BUCKET');
  const client = new S3Client({
    endpoint: required('S3_ENDPOINT'),
    region: required('S3_REGION'),
    forcePathStyle: true,
    credentials: { accessKeyId: required('S3_ACCESS_KEY_ID'), secretAccessKey: required('S3_SECRET_ACCESS_KEY') },
  });

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ['GET', 'HEAD'], AllowedHeaders: ['*'], MaxAgeSeconds: 86400 }],
      },
    }),
  );
  const { CORSRules } = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
  console.log(`[storage-cors] ${bucket}: ${JSON.stringify(CORSRules)}`);
}

main().catch((error) => {
  console.error(`[storage-cors] ${error.message}`);
  process.exit(1);
});
