import { Routes, Route, Outlet } from "react-router-dom";
import QuestionPage from "../pages/QuestionPage";
import AnswerPage from "../pages/AnswerPage";
import ResultPage from "../pages/ResultPage";
import AnswerSheetPage from "../pages/AnswerSheetPage";
import ReviewQuestionsPage from "../pages/ReviewQuestionsPage";
import SubmissionHistoryPage from "../pages/SubmissionHistoryPage";
import SubmissionDetailPage from "../pages/SubmissionDetailPage";
import StepperLayout from "../components/StepperLayout";
import AiExtractedQuestion from "../pages/AiExtrctedQuestion";

const StepperWrapper = () => {
  return (
    <StepperLayout>
      <Outlet />
    </StepperLayout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<StepperWrapper />}>
        <Route path="/" element={<QuestionPage />} />
        <Route path="/answers/:paperId" element={<AnswerPage />} />
        <Route path="/results/:paperId" element={<ResultPage />} />
      </Route>

      <Route path="/results/sheet/:answerId" element={<AnswerSheetPage />} />
      <Route path="/review-questions/:paperId" element={<ReviewQuestionsPage />} />
      

      <Route path="/submissions" element={<SubmissionHistoryPage />} />
      <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
      <Route path="/submissions/:id/questions" element={<AiExtractedQuestion />} />
    </Routes>
  );
};

export default AppRoutes;