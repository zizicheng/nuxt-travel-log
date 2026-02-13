import slugify from "slug";

import { findLocationByName, findUniqueSlug, insertLocation } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schema";

import sendZodError from "../utils/send-zod-error";

export default defineAuthenticatedEventHandler(async (event) => {
  const result = await readValidatedBody(event, InsertLocation.safeParse);
  if (!result.success) {
    return sendZodError(event, result.error);
  }

  const existingLocation = await findLocationByName(result.data, event.context.user.id);

  if (existingLocation) {
    return sendError(event, createError({
      statusCode: 409,
      statusMessage: "You already have a location with this name.",
    }));
  }

  const slug = await findUniqueSlug(slugify(result.data.name));

  try {
    return insertLocation(result.data, slug, event.context.user.id);
  }
  catch (e: unknown) {
    const code
      = typeof e === "object" && e !== null
        ? (e as any).code ?? (e as any).cause?.code
        : null;

    if (code === "SQLITE_CONSTRAINT") {
      throw createError({
        statusCode: 409,
        statusMessage: "Slug must be unique(the location name is used to generate the slug).",
      });
    }

    throw e;
  }
});
