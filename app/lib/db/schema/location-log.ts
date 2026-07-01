import type { z } from "zod";

import { relations } from "drizzle-orm";
import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import type { SelectLocationLogImage } from "./location-log-image";

import { DateSchema, DescriptionSchema, LatSchema, LongSchema, NameSchema } from "../../zod-schema";
import { user } from "./auth";
import { location } from "./location";
import { locationLogImage } from "./location-log-image";

export const locationLog = sqliteTable("locationLog", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  startedAt: int().notNull(),
  endedAt: int().notNull(),
  lat: real().notNull(),
  long: real().notNull(),
  locationId: int().notNull().references(() => location.id, { onDelete: "cascade" }),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const locationLogRelations = relations(locationLog, ({ one, many }) => ({
  location: one(location, {
    fields: [locationLog.locationId],
    references: [location.id],
  }),
  images: many(locationLogImage),
}));

export const InsertLocationLog = createInsertSchema(locationLog, {
  name: NameSchema,
  description: DescriptionSchema,
  lat: LatSchema,
  long: LongSchema,
  startedAt: DateSchema,
  endedAt: DateSchema,
}).omit({
  id: true,
  userId: true,
  locationId: true,
  createdAt: true,
  updatedAt: true,
}).superRefine((values, context) => {
  if (values.endedAt < values.startedAt || values.startedAt > values.endedAt) {
    context.addIssue({
      code: "custom",
      message: "Ended At must be after Started At",
      path: ["endedAt"],
    });
    context.addIssue({
      code: "custom",
      message: "Started At must be before Ended At",
      path: ["startedAt"],
    });
  }
});

export type InsertLocationLog = z.infer<typeof InsertLocationLog>;
export type SelectLocationLog = typeof locationLog.$inferSelect;
export type SelectLocationLogWithImages = SelectLocationLog & {
  images: SelectLocationLogImage[];
};
