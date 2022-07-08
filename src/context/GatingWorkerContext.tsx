import React, { useContext, useEffect, useRef, useState } from "react";

interface IGatingWorkerContext {
  worker: Worker | undefined;
}

const GatingWorkerContext = React.createContext<IGatingWorkerContext>({
  worker: undefined,
});

const useGatingWorker = () => useContext(GatingWorkerContext);

const GateWorkerProvider = ({
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
    <GatingWorkerContext.Provider value={{ worker: workerRef.current }}>
      {children}
    </GatingWorkerContext.Provider>
  );
};

export { GateWorkerProvider, useGatingWorker };
