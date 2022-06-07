import { Button, Flex, Progress, Text } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadedFile } from "../../types/TakeoverInput";

const TakeoverUploadForm = (props: {
  onFilesUploaded: (files: UploadedFile[]) => void;
}) => {
  const { onFilesUploaded } = props;

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const workerRef = useRef<Worker>();
  const onWorkerMessage = useCallback(
    (evt) => {
      //console.debug(evt.data);
      const payload = evt.data;
      if (payload.type === "progress") {
        setUploadProgress((old) => ({
          ...old,
          [payload.fileName]: payload.progress,
        }));
      } else if (payload.type === "finished") {
        setUploadProgress((old) => {
          const newProgress = Object.fromEntries(
            Object.entries(old).filter((e) => e[0] != payload.file.name)
          );
          //console.log(newProgress);
          return newProgress;
        });
        setFilesToUpload((old) => {
          return old.filter((o) => o.name !== payload.file.name);
        });
        onFilesUploaded([payload.file]);
      }
    },
    [onFilesUploaded]
  );

  useEffect(() => {
    console.log("new worker");
    workerRef.current = new Worker(
      new URL("../../workers/upload.ts", import.meta.url)
    );
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    console.log("hook lister");
    if (!workerRef.current) return;
    workerRef.current.onmessage = onWorkerMessage;
  }, [workerRef, onWorkerMessage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload((old) => [...old, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadFiles = useCallback(
    (files: File[]) => {
      if (!workerRef.current) {
        console.warn("no worker loaded");
        return;
      }

      files.forEach((file, i) =>
        workerRef.current!.postMessage({ file, index: i })
      );
    },
    [workerRef]
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
      <Flex direction="column" gridGap={3}>
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
