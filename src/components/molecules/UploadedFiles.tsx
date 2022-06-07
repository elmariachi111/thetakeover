import { Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { UploadedFile } from "../../types/TakeoverInput";

import {
  FaFileAudio,
  FaFileImage,
  FaFile,
  FaFileArchive,
  FaFileVideo,
} from "react-icons/fa";
import { downloadAndDecrypt } from "../../modules/encryption";

const icon = (fileType: string) => {
  switch (fileType) {
    case "image/jpg":
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
export const UploadedFiles = (props: {
  files: UploadedFile[];
  password: undefined | Uint8Array;
}) => {
  const { files, password } = props;

  return (
    <Flex direction="column" gap={3}>
      {files.map((f) => (
        <Flex key={f.cid} gap={3} justify="space-between">
          <Flex align="center" gap={2}>
            <Icon as={icon(f.contentType)} title={f.contentType} />
            <Text fontWeight="bold">{f.name}</Text>
            <Text
              fontSize="xs"
              onClick={async () => {
                if (!password) return console.warn("no password");
                const dec = await downloadAndDecrypt(f, password);
                console.log(dec);
              }}
            >
              {f.cid}
            </Text>
          </Flex>
          <Text>{f.contentLength}</Text>
        </Flex>
      ))}
    </Flex>
  );
};
