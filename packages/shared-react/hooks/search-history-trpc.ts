import { useCallback } from "react";

interface TRPCSearchHistoryClient {
  list: {
    useQuery: () => {
      data: { searchHistory: string[] } | undefined;
      refetch: () => Promise<unknown>;
    };
  };
  add: {
    useMutation: () => {
      mutateAsync: (input: { searchTerm: string }) => Promise<void>;
    };
  };
  clear: {
    useMutation: () => {
      mutateAsync: () => Promise<void>;
    };
  };
}

export function useSearchHistoryTRPC(trpc: TRPCSearchHistoryClient) {
  const { data, refetch } = trpc.list.useQuery();
  const addMutation = trpc.add.useMutation();
  const clearMutation = trpc.clear.useMutation();

  const history = data?.searchHistory ?? [];

  const addTerm = useCallback(
    async (term: string) => {
      if (!term || term.trim().length === 0) {
        return;
      }
      await addMutation.mutateAsync({ searchTerm: term });
      await refetch();
    },
    [addMutation, refetch],
  );

  const clearHistory = useCallback(async () => {
    await clearMutation.mutateAsync();
    await refetch();
  }, [clearMutation, refetch]);

  const refreshHistory = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    history,
    addTerm,
    clearHistory,
    refreshHistory,
  };
}
