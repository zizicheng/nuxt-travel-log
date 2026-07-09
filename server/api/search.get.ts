import { Buffer } from "node:buffer";
import { ProxyAgent, fetch as undiciFetch } from "undici";

import type { NominatimResult } from "~/lib/types";

import env from "~/lib/env";
import { SearchSchema } from "~/lib/zod-schema";

import sendZodError from "../utils/send-zod-error";

const proxyAgent = env.NODE_ENV === "development"
  ? new ProxyAgent("http://127.0.0.1:1080")
  : undefined;

export default defineAuthenticatedEventHandler(
  defineCachedEventHandler(async (event) => {
    const result = await getValidatedQuery(event, SearchSchema.safeParse);
    if (!result.success) {
      return sendZodError(event, result.error);
    }
    const searchParams = new URLSearchParams({
      q: result.data.q,
      format: "json",
    });

    try {
      const response = await undiciFetch(`https://nominatim.openstreetmap.org/search?${searchParams.toString()}`, {
        signal: AbortSignal.timeout(5000),
        dispatcher: proxyAgent,
        headers: {
          "User-Agent": "NuxtTravelLog/1.0 (contact: lttsd@foxmail.com)",
        },
      });

      if (!response.ok) {
        throw createError({
          statusCode: 504,
          statusMessage: "Unable to reach search API",
        });
      }
      const results = await response.json() as NominatimResult[];
      return results;
    }
    catch {
      throw createError({
        statusCode: 504,
        statusMessage: "Unable to reach search API",
      });
    }
  }, {
    maxAge: 60 * 60 * 24,
    name: "search-nominatim",
    getKey: (event) => {
      const query = getQuery(event);
      const q = query.q?.toString() ?? "";
      return Buffer.from(q).toString("base64");
    },
  }),
);
