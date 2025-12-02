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

import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";

import ProtectedRoute from "../components/ProtectedRoute";

const StepperWrapper = () => (
  <StepperLayout>
    <Outlet />
  </StepperLayout>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      <Route
        element={
          <ProtectedRoute>
            <StepperWrapper />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<QuestionPage />} />
        <Route path="/answers/:paperId" element={<AnswerPage />} />
        <Route path="/results/:paperId" element={<ResultPage />} />
      </Route>

      <Route
        path="/results/sheet/:answerId"
        element={
          <ProtectedRoute>
            <AnswerSheetPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review-questions/:paperId"
        element={
          <ProtectedRoute>
            <ReviewQuestionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <SubmissionHistoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id"
        element={
          <ProtectedRoute>
            <SubmissionDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id/questions"
        element={
          <ProtectedRoute>
            <AiExtractedQuestion />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<SignInPage />} />
    </Routes>
  );
};

export default AppRoutes;
