import {
  CircularProgress,
  Flex,
  IconButton,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import filesize from "file-size";
import { useCallback, useEffect, useState } from "react";
import { UploadedFile } from "../../../types/TakeoverInput";

import { FaDownload } from "react-icons/fa";

import { useGatingWorker } from "../../../context/GatingWorkerContext";
import { FileTypeIcon } from "../../atoms/BinaryFileTypeIcon";

const DownloadButton = (props: {
  file: UploadedFile;
  password: undefined | Uint8Array;
  onDecrypted?: (file: UploadedFile, content: ArrayBuffer) => void;
}) => {
  const { file, password, onDecrypted } = props;
  const [busy, setBusy] = useState(false);

  const { worker } = useGatingWorker();

  const onWorkerMessage = useCallback(
    (evt) => {
      const payload = evt.data;
      if (payload.topic === "decrypt_done") {
        if (onDecrypted) {
          onDecrypted(payload.file, payload.content);
        } else {
          console.log(payload.file, payload.content);
        }
        setBusy(false);
      }
    },
    [onDecrypted]
  );

  useEffect(() => {
    const current = worker?.current;
    if (!current) return;
    current.addEventListener("message", onWorkerMessage);
    return () => {
      current.removeEventListener("message", onWorkerMessage);
    };
  }, [worker, onWorkerMessage]);

  const requestDownload = async () => {
    if (!worker?.current) return console.warn("no worker");
    if (!password) return console.warn("no password");

    setBusy(true);
    worker.current.postMessage({
      topic: "decrypt",
      file,
      password,
    });
  };

  return busy ? (
    <CircularProgress isIndeterminate color="black" size={6} thickness={15} />
  ) : (
    <IconButton
      variant="ghost"
      aria-label="download"
      title={file.cid}
      icon={<FaDownload />}
      onClick={requestDownload}
    />
  );
};

const UploadedFile = (props: {
  file: UploadedFile;
  password: undefined | Uint8Array;
  onDecrypted?: (file: UploadedFile, content: ArrayBuffer) => void;
}) => {
  const { file, ...actionProps } = props;
  return (
    <Flex gap={3} justify="space-between" w="100%" align="center">
      <Flex align="center" gap={3}>
        <FileTypeIcon contentType={file.contentType} />
        <Flex direction="column">
          <Text fontWeight="bold">{file.fileName}</Text>
          <Text fontSize="xs">{filesize(file.contentLength).human("si")}</Text>
        </Flex>
      </Flex>

      <DownloadButton file={file} {...actionProps} />
    </Flex>
  );
};

export const UploadedFiles = (props: {
  files: UploadedFile[];
  password: undefined | Uint8Array;
  onDecrypted?: (file: UploadedFile, content: ArrayBuffer) => void;
}) => {
  const { files, ...actionProps } = props;

  return (
    <VStack
      spacing={3}
      w="100%"
      divider={<StackDivider borderColor="gray.600" />}
    >
      {files.map((f) => (
        <UploadedFile key={f.cid} file={f} {...actionProps} />
      ))}
    </VStack>
  );
};
