import { Button, Flex, Progress, Text } from "@chakra-ui/react";
import { nanoid } from "nanoid/async";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useGatingWorker } from "../../context/GatingWorkerContext";
import { UploadedFile } from "../../types/TakeoverInput";

const TakeoverUploadForm = (props: {
  onFilesUploaded: (files: UploadedFile[], password: Uint8Array) => void;
}) => {
  const { onFilesUploaded } = props;
  const [bundlePassword, setBundlePassword] = useState<Uint8Array>();
  const [bundleId, setBundleId] = useState<string>();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const { worker } = useGatingWorker();

  useEffect(() => {
    setBundlePassword(crypto.getRandomValues(new Uint8Array(32)));
    nanoid().then(setBundleId);
  }, []);

  const onWorkerMessage = useCallback(
    (evt) => {
      if (!bundlePassword) return;
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
        onFilesUploaded([payload.file], bundlePassword);
      }
    },
    [onFilesUploaded, bundlePassword]
  );

  useEffect(() => {
    if (!worker) return;
    worker.addEventListener("message", onWorkerMessage);
    return () => {
      worker.removeEventListener("message", onWorkerMessage);
    };
  }, [worker, onWorkerMessage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload((old) => [...old, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadFiles = useCallback(
    (files: File[]) => {
      if (!worker || !bundlePassword || !bundleId) {
        console.warn("no worker loaded");
        return;
      }

      files.forEach((file) =>
        worker.postMessage({
          topic: "store",
          file,
          bundleId,
          password: bundlePassword,
        })
      );
    },
    [worker, bundlePassword, bundleId]
  );

  return (
    <>
      <Flex
        justify="space-between"
        border="3px solid"
        borderColor="gray.400"
        p={6}
      >
        <Flex {...getRootProps()} direction="column">
          <input {...getInputProps()} />
          <p>Drop some files here, or click to select files</p>
        </Flex>
        {/* {!!files && <Button onClick={() => storeFiles(files)}>upload</Button>} */}
      </Flex>
      <Flex direction="column" gridGap={3} my={3}>
        {filesToUpload.map((f) => (
          <Flex key={f.name} direction="column">
            <Flex justify="space-between">
              <Text>{f.name}</Text>
              <Text>{f.size}</Text>
            </Flex>
            {!!uploadProgress[f.name] && (
              <Progress
                size="md"
                value={uploadProgress[f.name]}
                isAnimated
                hasStripe
              />
            )}
          </Flex>
        ))}
        {filesToUpload.length > 0 && (
          <Button
            w="100%"
            disabled={Object.keys(uploadProgress).length > 0}
            onClick={() => uploadFiles(filesToUpload)}
          >
            Upload files
          </Button>
        )}
      </Flex>
    </>
  );
};

export default TakeoverUploadForm;
