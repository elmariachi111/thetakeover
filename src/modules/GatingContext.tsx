import React, { useContext, useEffect, useRef, useState } from "react";

interface IGatingContext {
  worker: Worker | undefined;
}

const GatingContext = React.createContext<IGatingContext>({
  worker: undefined,
});

const useGate = () => useContext(GatingContext);

const GateProvider = ({
  children,
  chain,
}: {
  children: React.ReactNode;
  chain?: string;
}) => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    console.log("new worker");
    workerRef.current = new Worker(
      new URL("../workers/upload.ts", import.meta.url)
    );
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  return (
    <GatingContext.Provider value={{ worker: workerRef.current }}>
      {children}
    </GatingContext.Provider>
  );
};

export { GateProvider, useGate };
