// contexts/OpenCardsQueueContext.tsx
import React, { createContext, useContext, useState } from "react";

interface OpenCardsQueueContextType {
  queue: string[];
  addToQueue: (cardIds: string[]) => void;
  removeFromQueue: () => string | undefined;
  clearQueue: () => void;
  currentCard: () => string | undefined;
}

const OpenCardsQueueContext = createContext<
  OpenCardsQueueContextType | undefined
>(undefined);

export function OpenCardsQueueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queue, setQueue] = useState<string[]>([]);

  const addToQueue = (cardIds: string[]) => {
    setQueue((prev) => [...prev, ...cardIds]);
  };

  const removeFromQueue = () => {
    const [first, ...rest] = queue;
    setQueue(rest);
    return first;
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const currentCard = () => {
    return queue[0];
  };

  return (
    <OpenCardsQueueContext.Provider
      value={{ queue, addToQueue, removeFromQueue, clearQueue, currentCard }}
    >
      {children}
    </OpenCardsQueueContext.Provider>
  );
}

export function useOpenCardsQueue() {
  const context = useContext(OpenCardsQueueContext);
  if (context === undefined) {
    throw new Error(
      "useOpenCardsQueue must be used within a OpenCardsQueueProvider"
    );
  }
  return context;
}
