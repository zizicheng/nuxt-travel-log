import { findLocation } from "~/lib/db/queries/location";

export default defineAuthenticatedEventHandler(async (event) => {
  return findLocation(event.context.user.id);
});
