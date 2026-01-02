import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import GlobalJobListener from "./components/GlobalJobListener";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            fontWeight: 600,
          },
        }}
      />
      <GlobalJobListener />
      <AppRoutes />
    </>
  );
}

export default App;
