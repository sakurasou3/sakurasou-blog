import { Spinner, Stack } from "@chakra-ui/react";

const Loading = () => {
  return (
    <Stack
      height="calc(100vh - 72px)"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size="xl" />
    </Stack>
  );
};

export default Loading;
