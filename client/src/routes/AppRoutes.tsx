import { useEffect } from "react";
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

const WithTitle = ({ title, children }: { title: string; children: React.ReactNode }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}</>;
};

const StepperWrapper = () => (
  <StepperLayout>
    <Outlet />
  </StepperLayout>
);

const AppRoutes = () => {
  return (
    <Routes>

      <Route
        path="/sign-in"
        element={
          <WithTitle title="Login | AI Eval">
            <SignInPage />
          </WithTitle>
        }
      />

      <Route
        path="/sign-up"
        element={
          <WithTitle title="Join | AI Eval">
            <SignUpPage />
          </WithTitle>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <StepperWrapper />
          </ProtectedRoute>
        }
      >
        <Route
          path="/"
          element={
            <WithTitle title="AI Eval">
              <QuestionPage />
           </WithTitle>
          }
        />

        <Route
          path="/answers/:paperId"
          element={
            <WithTitle title="Answers | AI Eval">
              <AnswerPage />
            </WithTitle>
          }
        />

        <Route
          path="/results/:paperId"
          element={
            <WithTitle title="Results | AI Eval">
              <ResultPage />
            </WithTitle>
          }
        />
      </Route>

      <Route
        path="/results/sheet/:answerId"
        element={
          <ProtectedRoute>
            <WithTitle title="Sheet | AI Eval">
              <AnswerSheetPage />
            </WithTitle>
          </ProtectedRoute>
        }
      />

      <Route
        path="/review-questions/:paperId"
        element={
          <ProtectedRoute>
            <WithTitle title="Review Qs | AI Eval">
              <ReviewQuestionsPage />
            </WithTitle>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <WithTitle title="History | AI Eval">
              <SubmissionHistoryPage />
            </WithTitle>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id"
        element={
          <ProtectedRoute>
            <WithTitle title="Report | AI Eval">
              <SubmissionDetailPage />
            </WithTitle>
          </ProtectedRoute>
        }
      />

      <Route
        path="/submissions/:id/questions"
        element={
          <ProtectedRoute>
            <WithTitle title="AI Extract | AI Eval">
              <AiExtractedQuestion />
            </WithTitle>
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <WithTitle title="404 | AI Eval">
            <SignInPage />
          </WithTitle>
        }
      />

    </Routes>
  );
};

export default AppRoutes;