import { Container, Flex, Image, Text } from "@chakra-ui/react";
import { XLink } from "../../../types/Link";
import { UploadedFile } from "../../../types/TakeoverInput";
import { TitleAndCreator } from "../../atoms/TitleAndCreator";
import { UploadedFiles } from "../FileUploads";

export const ViewFiles = (props: { link: XLink }) => {
  const { link } = props;

  const downloadDecryptedFile = async (
    file: UploadedFile,
    content: ArrayBuffer
  ) => {
    const blob = new Blob([content]);
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file.fileName;
    link.click();
  };

  return (
    <Container maxW="container.xl" px={[2, 2, null]}>
      <Flex
        direction="column"
        justify="center"
        w="100%"
        minH="100vh"
        align="center"
        gap={12}
      >
        <TitleAndCreator link={link} />
        {link.metadata.previewImage && (
          <Image src={link.metadata.previewImage} alt={link.metadata.title} />
        )}
        {link.files && (
          <UploadedFiles
            files={link.files?.files}
            password={new Uint8Array(link.files.password.data)}
            onDecrypted={downloadDecryptedFile}
          />
        )}
        <Flex>
          <Text>{link.metadata.description}</Text>
        </Flex>
      </Flex>
    </Container>
  );
};
