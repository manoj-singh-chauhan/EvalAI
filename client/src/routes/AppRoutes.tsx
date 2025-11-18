import { Routes, Route } from "react-router-dom";
import QuestionPage from "../pages/QuestionPage";
import AnswerPage from "../pages/AnswerPage";
import ResultPage from "../pages/ResultPage";
import AnswerSheetPage from "../pages/AnswerSheetPage"
import ReviewQuestionsPage from "../pages/ReviewQuestionsPage"
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<QuestionPage />} />
      <Route path="/answers/:paperId" element={<AnswerPage />} />
      <Route path="/results/:paperId" element={<ResultPage />} />
      <Route path="/results/sheet/:answerId" element={<AnswerSheetPage />} />
      <Route path="/review-questions/:paperId" element={<ReviewQuestionsPage />} />
    </Routes>
  );
};

export default AppRoutes;
