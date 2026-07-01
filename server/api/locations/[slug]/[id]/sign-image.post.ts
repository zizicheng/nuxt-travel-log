import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";

const MAX_CONTENT_LENGTH = 1024 * 1024 * 0.5;

const ImageSchema = z.object({
  contentLength: z.number().min(1).max(MAX_CONTENT_LENGTH),
});

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, ImageSchema.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  await event.$fetch(`/api/locations/${slug}/${id}`);

  const client = createS3Client();

  const fileName = crypto.randomUUID();
  const key = `${event.context.user.id}/${id}/${fileName}.jpg`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentLength: result.data.contentLength,
    Metadata: {
      "user-id": event.context.user.id.toString(),
      "location-log-id": id,
    },
  });

  const url = await getSignedUrl(client, command, { expiresIn: 120 });

  return {
    url,
    // fields,
    key,
  };
});
