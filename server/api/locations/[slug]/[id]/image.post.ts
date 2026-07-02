import { findLocation } from "~/lib/db/queries/location";
import { insertLocationLogImage } from "~/lib/db/queries/location-log-image";
import { InsertLocationLogImage } from "~/lib/db/schema";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertLocationLogImage.safeParse);

  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const slug = getRouterParam(event, "slug") as string;
  const id = getRouterParam(event, "id") as string;

  const location = await findLocation(slug, event.context.user.id);

  if (!location) {
    throw createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    });
  }

  const inserted = await insertLocationLogImage(Number(id), result.data, event.context.user.id);
  return inserted;
});
