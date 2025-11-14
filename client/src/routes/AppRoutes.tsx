import { Routes, Route } from "react-router-dom";
import QuestionPage from "../pages/QuestionPage";
import AnswerPage from "../pages/AnswerPage";
import ResultPage from "../pages/ResultPage";
// import PaperStatusPage from "../pages/PaperStatusPage"

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuestionPage />} />
      <Route path="/answers/:paperId" element={<AnswerPage />} />
      <Route path="/results/:paperId" element={<ResultPage />} />
      {/* <Route path="/paper-status/:id" element={<PaperStatusPage />} /> */}

    </Routes>
  );
};

export default AppRoutes;