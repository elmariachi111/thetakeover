import { nanoid } from "nanoid/async";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useGatingWorker } from "../../../context/GatingWorkerContext";
import { UploadedFile } from "../../../types/TakeoverInput";

interface IUploadContext {
  uploadProgress: Record<string, number>;
  filesToUpload: File[];
  acceptFiles: (files: File[]) => void;
  uploadFiles: () => void;
}

export type FileBundleMeta = {
  password: Uint8Array;
  bundleId: string;
};

const UploadContext = React.createContext<IUploadContext>({
  uploadProgress: {},
  filesToUpload: [],
  acceptFiles: () => {
    return;
  },
  uploadFiles: () => {
    return;
  },
});

const useUpload = () => useContext(UploadContext);

const UploadProvider = (props: {
  children: React.ReactNode;
  password: Uint8Array | undefined;
  setPassword: (password: Uint8Array) => void;
  onFilesUploaded: (files: UploadedFile[]) => void;
}) => {
  const { worker } = useGatingWorker();

  const { onFilesUploaded, password, setPassword } = props;
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [bundleId, setBundleId] = useState<string>();

  useEffect(() => {
    (async () => {
      const pw = crypto.getRandomValues(new Uint8Array(32));
      setBundleId(await nanoid());
      setPassword(pw);
    })();
  }, []);

  const onWorkerMessage = useCallback(
    (evt) => {
      const payload = evt.data;
      if (payload.topic === "store_progress") {
        setUploadProgress((old) => ({
          ...old,
          [payload.fileName]: payload.progress,
        }));
      } else if (payload.topic === "store_finished") {
        setUploadProgress((old) => {
          return Object.fromEntries(
            Object.entries(old).filter((e) => e[0] != payload.file.fileName)
          );
        });
        setFilesToUpload((old) => {
          return old.filter((o) => o.name !== payload.file.fileName);
        });
        onFilesUploaded([payload.file]);
      }
    },
    [onFilesUploaded]
  );

  useEffect(() => {
    if (!worker) return;
    worker.addEventListener("message", onWorkerMessage);
    return () => {
      worker.removeEventListener("message", onWorkerMessage);
    };
  }, [worker, onWorkerMessage]);

  const acceptFiles = (acceptedFiles: File[]) => {
    setFilesToUpload((old) => [...old, ...acceptedFiles]);
  };

  const uploadFiles = useCallback(() => {
    if (!worker || !password || !bundleId) {
      console.warn("no worker loaded");
      return;
    }

    filesToUpload.forEach((file) =>
      worker.postMessage({
        topic: "store",
        file,
        password,
        bundleId,
      })
    );
  }, [worker, password, bundleId, filesToUpload]);

  return (
    <UploadContext.Provider
      value={{ uploadProgress, filesToUpload, acceptFiles, uploadFiles }}
    >
      {bundleId && password ? props.children : <></>}
    </UploadContext.Provider>
  );
};

export { UploadProvider, useUpload };
