

import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import StepperLayout from "./components/StepperLayout";

function App() {
  return (
    <>
      <StepperLayout>
        <AppRoutes />
      </StepperLayout>
    </>
  );
}

export default App;
