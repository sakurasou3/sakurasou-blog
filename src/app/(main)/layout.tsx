import { Header } from "@/components/ui/header";
import { Box } from "@chakra-ui/react";

const MainLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div>
      <Header />
      <main>
        <Box maxWidth={{ base: "90%", md: 640, lg: 900 }} m="auto" pt="2em">
          {children}
        </Box>
      </main>
    </div>
  );
};

export default MainLayout;
