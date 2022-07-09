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
  setPassword: (password: Uint8Array) => void;
  onFilesUploaded: (files: UploadedFile[]) => void;
}) => {
  const { worker } = useGatingWorker();

  const { onFilesUploaded, setPassword } = props;
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [bundleId, setBundleId] = useState<string>();

  const [_password, _setPassword] = useState<Uint8Array>();

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
    const current = worker?.current;
    if (!current) return;
    current.addEventListener("message", onWorkerMessage);
    return () => {
      current.removeEventListener("message", onWorkerMessage);
    };
  }, [worker, onWorkerMessage]);

  const acceptFiles = useCallback(
    async (acceptedFiles: File[]) => {
      if (!_password) {
        const pw = crypto.getRandomValues(new Uint8Array(32));
        setPassword(pw);
        _setPassword(pw);
      }
      if (!bundleId) {
        setBundleId(await nanoid());
      }

      setFilesToUpload((old) => [...old, ...acceptedFiles]);
    },
    [_setPassword, setPassword, _password, bundleId]
  );

  const uploadFiles = useCallback(() => {
    const current = worker?.current;
    if (!current || !_password || !bundleId) {
      console.warn("no worker loaded", current);
      return;
    }

    filesToUpload.forEach((file) =>
      current.postMessage({
        topic: "store",
        file,
        password: _password,
        bundleId,
      })
    );
  }, [_password, bundleId, filesToUpload, worker]);

  return (
    <UploadContext.Provider
      value={{ uploadProgress, filesToUpload, acceptFiles, uploadFiles }}
    >
      {props.children}
    </UploadContext.Provider>
  );
};

export { UploadProvider, useUpload };
