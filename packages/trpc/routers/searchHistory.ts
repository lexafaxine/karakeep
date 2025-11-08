import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { searchHistory } from "@karakeep/db/schema";

import { authedProcedure, router } from "../index";

export const searchHistoryAppRouter = router({
  list: authedProcedure
    .output(z.object({ searchHistory: z.array(z.string()) }))
    .query(async ({ ctx }) => {
      const history = await ctx.db
        .select({ searchTerm: searchHistory.searchTerm })
        .from(searchHistory)
        .where(eq(searchHistory.userId, ctx.user.id))
        .orderBy(desc(searchHistory.createdAt))
        .limit(50);

      return {
        searchHistory: history.map((h) => h.searchTerm),
      };
    }),

  add: authedProcedure
    .input(z.object({ searchTerm: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if this search term already exists for this user
      const existing = await ctx.db
        .select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, ctx.user.id))
        .limit(50);

      // Remove any existing entries with the same search term (case-insensitive)
      const lowerSearchTerm = input.searchTerm.toLowerCase();
      const toDelete = existing.filter(
        (h) => h.searchTerm.toLowerCase() === lowerSearchTerm,
      );

      if (toDelete.length > 0) {
        await ctx.db
          .delete(searchHistory)
          .where(eq(searchHistory.id, toDelete[0].id));
      }

      // Add the new search term
      await ctx.db.insert(searchHistory).values({
        searchTerm: input.searchTerm,
        userId: ctx.user.id,
      });

      // If we have more than 50 entries, delete the oldest ones
      if (existing.length >= 50) {
        const allHistory = await ctx.db
          .select()
          .from(searchHistory)
          .where(eq(searchHistory.userId, ctx.user.id))
          .orderBy(desc(searchHistory.createdAt));

        if (allHistory.length > 50) {
          const toRemove = allHistory.slice(50);
          for (const item of toRemove) {
            await ctx.db.delete(searchHistory).where(eq(searchHistory.id, item.id));
          }
        }
      }
    }),

  clear: authedProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .delete(searchHistory)
      .where(eq(searchHistory.userId, ctx.user.id));
  }),
});
