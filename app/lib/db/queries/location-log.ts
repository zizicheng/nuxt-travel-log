import type { InsertLocationLog } from "../schema";

import db from "..";
import { locationLog } from "../schema";

export async function insertLocationLog(
  locationId: number,
  inserttable: InsertLocationLog,
  userId: number,
) {
  const [inserted] = await db.insert(locationLog).values({
    ...inserttable,
    locationId,
    userId,
  }).returning();

  return inserted;
}
