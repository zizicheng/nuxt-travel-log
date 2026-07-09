import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

import { findLocation } from "~/lib/db/queries/location";
import { deleteLocationLogImage } from "~/lib/db/queries/location-log-image";
import env from "~/lib/env";
import createS3Client from "~/utils/create-s3-client";

export default defineAuthenticatedEventHandler(async (event) => {
  const imageId = getRouterParam(event, "image-id") as string;

  if (!z.coerce.number().safeParse(imageId).success) {
    throw createError({
      statusCode: 422,
      statusMessage: "Invalid image id.",
    });
  }

  const slug = getRouterParam(event, "slug") as string;

  const location = await findLocation(slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const deleted = await deleteLocationLogImage(Number(imageId), event.context.user.id);

  if (deleted) {
    const client = createS3Client();
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: deleted.key,
    });

    await client.send(command);
  }

  setResponseStatus(event, 204);
});
