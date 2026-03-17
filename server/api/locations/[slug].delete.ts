import { removeLocationBySlug } from "~/lib/db/queries/location";

export default defineAuthenticatedEventHandler(async (event) => {
  return sendError(event, createError({
    statusCode: 404,
    statusMessage: "Location not found.",
  }));
  await new Promise(resolve => setTimeout(resolve, 1000));
  const slug = getRouterParam(event, "slug") as string;

  const deleted = await removeLocationBySlug(slug, event.context.user.id);

  if (!deleted) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "Location not found.",
    }));
  }

  setResponseStatus(event, 204);
});
