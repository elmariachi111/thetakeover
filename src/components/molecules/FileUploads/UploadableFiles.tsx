import { Button, Flex, Progress, Text } from "@chakra-ui/react";
import { FileTypeIcon } from "../../atoms/BinaryFileTypeIcon";
import { useUpload } from "./Context";
import filesize from "file-size";

const FileUploadIndicator = ({ file }: { file: File }) => {
  const { uploadProgress } = useUpload();

  return (
    <Flex justify="space-between" align="center">
      <Flex align="center" gap={3} w="90%">
        <FileTypeIcon contentType={file.type} />
        <Flex direction="column" gap={1} w="full">
          <Text>{file.name}</Text>
          {!!uploadProgress[file.name] && (
            <Progress
              size="md"
              value={uploadProgress[file.name]}
              isAnimated
              hasStripe
            />
          )}
        </Flex>
      </Flex>
      <Text>{filesize(file.size).human("si")}</Text>
    </Flex>
  );
};

const UploadableFiles = (props) => {
  const { filesToUpload, uploadFiles, uploadProgress } = useUpload();

  return (
    <Flex direction="column" gridGap={3} my={3}>
      {filesToUpload.map((f) => (
        <FileUploadIndicator file={f} key={f.name} />
      ))}

      {filesToUpload.length > 0 && (
        <Button
          w="100%"
          disabled={Object.keys(uploadProgress).length > 0}
          onClick={uploadFiles}
        >
          Upload files
        </Button>
      )}
    </Flex>
  );
};

export { UploadableFiles };
