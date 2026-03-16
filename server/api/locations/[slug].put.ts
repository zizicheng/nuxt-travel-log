import { findLocationByName, updateLocationBySlug } from "~/lib/db/queries/location";
import { InsertLocation } from "~/lib/db/schema";

export default defineAuthenticatedEventHandler(async (event) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const slug = getRouterParam(event, "slug") as string;
  const result = await readValidatedBody(event, InsertLocation.safeParse);
  if (!result.success) {
    return sendZodError(event, result.error);
  }
  const existingLocation = await findLocationByName(result.data, event.context.user.id);

  if (existingLocation && existingLocation.slug !== slug) {
    return sendError(event, createError({
      statusCode: 409,
      statusMessage: "You already have a location with this name.",
    }));
  }

  return updateLocationBySlug(result.data, slug, event.context.user.id);
});
