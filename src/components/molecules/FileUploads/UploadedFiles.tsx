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
  requestDownload: (file: UploadedFile) => void;
  file: UploadedFile;
  busy?: boolean;
}) => {
  const { file, requestDownload, busy } = props;
  return busy ? (
    <CircularProgress isIndeterminate color="black" size={6} thickness={15} />
  ) : (
    <IconButton
      variant="ghost"
      aria-label="download"
      title={file.cid}
      icon={<FaDownload />}
      onClick={() => {
        requestDownload(file);
      }}
    />
  );
};

export const UploadedFiles = (props: {
  files: UploadedFile[];
  password: undefined | Uint8Array;
  onDecrypted?: (file: UploadedFile, content: ArrayBuffer) => void;
}) => {
  const { files, onDecrypted, password } = props;
  const [busy, setBusy] = useState<Record<string, boolean>>(
    Object.fromEntries(files.map((f) => [f.cid, false]))
  );

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
        setBusy((old) => {
          const newBuzy = { ...old };
          newBuzy[payload.file.cid] = false;
          return newBuzy;
        });
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

  const requestDownload = useCallback(
    async (file: UploadedFile) => {
      const current = worker?.current;
      if (!current) return console.warn("no worker");
      if (!password) return console.error("no password");

      setBusy((old) => {
        const newBuzy = { ...old };
        newBuzy[file.cid] = true;
        return newBuzy;
      });

      current.postMessage({
        topic: "decrypt",
        file,
        password,
      });
    },
    [setBusy, worker, password]
  );

  return (
    <VStack
      spacing={3}
      w="100%"
      divider={<StackDivider borderColor="gray.600" />}
    >
      {files.map((file) => (
        <Flex
          gap={3}
          key={file.cid}
          justify="space-between"
          w="100%"
          align="center"
        >
          <Flex align="center" gap={3}>
            <FileTypeIcon contentType={file.contentType} />
            <Flex direction="column">
              <Text fontWeight="bold">{file.fileName}</Text>
              <Text fontSize="xs">
                {filesize(file.contentLength).human("si")}
              </Text>
            </Flex>
          </Flex>

          <DownloadButton
            file={file}
            requestDownload={requestDownload}
            busy={busy[file.cid]}
          />
        </Flex>
      ))}
    </VStack>
  );
};
