import "./index.css";
import AppRoutes from "./routes/AppRoutes";
// import StepperLayout from "./components/StepperLayout";
import GlobalJobListener from "./components/GlobalJobListener";

function App() {
  return (
    <>
      <GlobalJobListener />
      
        <AppRoutes />
      
    </>
  );
}

export default App;
