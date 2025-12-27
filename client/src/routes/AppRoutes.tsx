import { useEffect } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

import QuestionPage from "../pages/QuestionPage";
import AnswerPage from "../pages/AnswerPage";
import ResultPage from "../pages/ResultPage";
import AnswerSheetPage from "../pages/AnswerSheetPage";
import ReviewQuestionsPage from "../pages/ReviewQuestionsPage";
import SubmissionHistoryPage from "../pages/SubmissionHistoryPage";
import SubmissionDetailPage from "../pages/SubmissionDetailPage";
import AiExtractedQuestion from "../pages/AiExtrctedQuestion";
import Workflow from "../pages/Workflow";

import StepperLayout from "../components/StepperLayout";
import { SidebarWrapper } from "../components/SidebarWrapper";
import ProtectedRoute from "../components/ProtectedRoute";

import SignInPage from "../pages/SignInPage";
import SignUpPage from "../pages/SignUpPage";
import Analytics from "../pages/Analytics";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminUserActivityPage from "../pages/admin/AdminUserActivityPage";

const WithTitle = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
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

const MainLayout = () => (
  <SidebarWrapper>
    <Outlet />
  </SidebarWrapper>
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
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<StepperWrapper />}>
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
          path="/workflow"
          element={
            <WithTitle title="Workflow | AI Eval">
              <Workflow />
            </WithTitle>
          }
        />

        <Route
          path="/analytics"
          element={
            <WithTitle title="Analytics | AI Eval">
              <Analytics />
            </WithTitle>
          }
        />

        <Route
          path="/results/sheet/:answerId"
          element={
            <WithTitle title="Sheet | AI Eval">
              <AnswerSheetPage />
            </WithTitle>
          }
        />

        <Route
          path="/review-questions/:paperId"
          element={
            <WithTitle title="Review Qs | AI Eval">
              <ReviewQuestionsPage />
            </WithTitle>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <WithTitle title="Admin Users | AI Eval">
              <AdminUsersPage />
            </WithTitle>
          }
        />

        <Route
          path="/admin/user/:userId"
          element={
            <WithTitle title="User Activity | AI Eval">
              <AdminUserActivityPage />
            </WithTitle>
          }
        />

        <Route
          path="/submissions"
          element={
            <WithTitle title="History | AI Eval">
              <SubmissionHistoryPage />
            </WithTitle>
          }
        />

        <Route
          path="/submissions/:id"
          element={
            <WithTitle title="Report | AI Eval">
              <SubmissionDetailPage />
            </WithTitle>
          }
        />

        <Route
          path="/submissions/:id/questions"
          element={
            <WithTitle title="AI Extract | AI Eval">
              <AiExtractedQuestion />
            </WithTitle>
          }
        />
      </Route>

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