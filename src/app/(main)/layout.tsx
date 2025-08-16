import { Header } from "@/components/ui/header";
import { Box } from "@chakra-ui/react";

const MainLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div>
      <Header />
      <main>
        <Box maxWidth={{ mdTo2xl: 640, base: "90%" }} m="auto" pt="2em">
          {children}
        </Box>
      </main>
    </div>
  );
};

export default MainLayout;
