import { Button, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

interface ICloudinaryUploadWidget {
  open: () => void;
}

const CLOUDINARY_UPLOAD_PRESET = "user_preview";

const CloudinaryUploadWidget = (props: { onUploaded: (info: any) => void }) => {
  const { onUploaded } = props;

  const [widget, setWidget] = useState<ICloudinaryUploadWidget>();

  useEffect(() => {
    const _widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        cropping: true,
        croppingAspectRatio: 4 / 3,
        sources: ["local", "url"],
        multiple: false,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          console.log(result);
          onUploaded(result.info);
          //console.log("Done! Here is the image info: ", result.info);
        }
      }
    );

    setWidget(_widget as any);
  }, []);

  return widget ? (
    <Button onClick={() => widget.open()}>Upload</Button>
  ) : (
    <Text>loading...</Text>
  );
};

export default CloudinaryUploadWidget;
