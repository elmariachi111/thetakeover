import {
  CircularProgress,
  Flex,
  Icon,
  IconButton,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { UploadedFile } from "../../types/TakeoverInput";
import filesize from "file-size";

import {
  FaFileAudio,
  FaFileImage,
  FaFile,
  FaFileArchive,
  FaFileVideo,
  FaDownload,
} from "react-icons/fa";

import { useGatingWorker } from "../../context/GatingWorkerContext";

const icon = (fileType: string) => {
  switch (fileType) {
    case "image/jpg":
    case "image/jpeg":
    case "image/png":
      return FaFileImage;
    case "video/mp4":
      return FaFileVideo;
    case "audio/mp3":
    case "audio/aac":
      return FaFileAudio;
    case "application/zip":
      return FaFileArchive;
    default:
      return FaFile;
  }
};

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
        }
        setBusy(false);
      }
    },
    [onDecrypted]
  );

  useEffect(() => {
    if (!worker) return;
    worker.addEventListener("message", onWorkerMessage);
    return () => {
      worker.removeEventListener("message", onWorkerMessage);
    };
  }, [worker, onWorkerMessage]);

  const requestDownload = async () => {
    if (!worker) return console.warn("no worker");
    if (!password) return console.warn("no password");

    setBusy(true);
    worker.postMessage({
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
        <Icon
          as={icon(file.contentType)}
          title={file.contentType}
          w={8}
          h={8}
        />
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
