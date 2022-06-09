import {
  CircularProgress,
  Flex,
  Icon,
  IconButton,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
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
import { downloadAndDecrypt } from "../../modules/encryption";

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
  const download = async () => {
    setBusy(true);
    if (!password) return console.warn("no password");
    const dec = await downloadAndDecrypt(file, password);
    setBusy(false);
    if (onDecrypted) {
      onDecrypted(file, dec);
    }
  };

  return busy ? (
    <CircularProgress isIndeterminate color="black" size={6} thickness={15} />
  ) : (
    <IconButton
      variant="ghost"
      aria-label="download"
      title={file.cid}
      icon={<FaDownload />}
      onClick={download}
    />
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
        <Flex
          key={f.cid}
          gap={3}
          justify="space-between"
          w="100%"
          align="center"
        >
          <Flex align="center" gap={3}>
            <Icon as={icon(f.contentType)} title={f.contentType} w={8} h={8} />
            <Flex direction="column">
              <Text fontWeight="bold">{f.fileName}</Text>
              <Text fontSize="xs">{filesize(f.contentLength).human("si")}</Text>
            </Flex>
          </Flex>

          <DownloadButton file={f} {...actionProps} />
        </Flex>
      ))}
    </VStack>
  );
};
