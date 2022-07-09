import { Icon } from "@chakra-ui/react";
import {
  FaFile,
  FaFileArchive,
  FaFileAudio,
  FaFileImage,
  FaFileVideo,
} from "react-icons/fa";

export function fileIcon(fileType: string) {
  switch (fileType) {
    case "image/jpg":
    case "image/jpeg":
    case "image/png":
      return FaFileImage;
    case "video/mp4":
    case "video/webm":
      return FaFileVideo;
    case "audio/mp3":
    case "audio/aac":
      return FaFileAudio;
    case "application/zip":
      return FaFileArchive;
    default:
      return FaFile;
  }
}

export function FileTypeIcon({ contentType }: { contentType: string }) {
  return <Icon as={fileIcon(contentType)} title={contentType} w={8} h={8} />;
}
