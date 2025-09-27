import { HStack, Image } from "@chakra-ui/react";

interface Props {
  src?: string | Blob;
}

const PostImage = ({ src }: Props) => {
  return (
    <HStack justifyContent="center">
      <Image src={src} />
    </HStack>
  );
};

export default PostImage;
