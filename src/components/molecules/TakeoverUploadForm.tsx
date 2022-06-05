import { Button, Flex, Progress, Text, VStack } from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { storeFile } from "../../modules/storeFiles";
import { UploadedFile } from "../../types/TakeoverInput";

export const TakeoverUploadForm = (props: {
  onFilesUploaded: (files: UploadedFile[]) => void;
}) => {
  const { onFilesUploaded } = props;

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFilesToUpload((old) => [...old, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadFiles = async (files: File[]) => {
    const _uploadProgress = (fileName: string) => {
      return (progress: number) => {
        setUploadProgress((old) => ({ ...old, [fileName]: progress }));
      };
    };

    const promises = files.map((file, i) =>
      storeFile(file, _uploadProgress(file.name))
    );

    const uploadedFiles = await Promise.all(promises);
    setUploadProgress({});
    setFilesToUpload([]);
    return uploadedFiles;
  };

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
        <Button
          w="100%"
          disabled={filesToUpload.length == 0}
          onClick={async () => {
            const uploaded = await uploadFiles(filesToUpload);
            onFilesUploaded(uploaded);
          }}
        >
          Upload files
        </Button>
      </Flex>
    </>
  );
};
