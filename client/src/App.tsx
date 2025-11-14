// import "./index.css";
// import AppRoutes from "./routes/AppRoutes";
// function App() {
//   return (
//     <>
//       <AppRoutes />
//     </>
//   );
// }

// export default App;


import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import StepperLayout from "./components/StepperLayout"; // Import the new layout

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