import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { createContext, useState, useContext } from "react";
import { lookInSession } from "./common/session";

import { Toaster } from "react-hot-toast";
import "./index.css";

// Components
import SideNav from "./components/sidenavbar.component";
import Loader from "./components/loader.component";
import AppLayout from "./layouts/AppLayout";
// Admin
import AdminAppLayout from "./layouts/AdminAppLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFinance from "./pages/admin/finance/AdminFinance";
import AdminExpenditures from "./pages/admin/finance/AdminExpenditures";
import AdminBalance from "./pages/admin/finance/AdminBalance";
import AdminRoute from "./routes/AdminRoute";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminRolePanel from "./components/admin/AdminRolePanel";

// Other pages
import AcademicPage from "./pages/profile/AcademicPage";
import AcademicForm from "./components/profile/academic/AcademicForm";
import ProfessionalProfile from "./pages/profile/ProfessionalProfile";
import ChatPage from "./pages/chat/ChatPage";
import DonorDashboard from "./components/donation/donor-dashboard.component";
import OnboardingPage from "./pages/onboarding/OnboardingPage";
import WelcomePage from "./pages/WelcomePage";
import PageRenderer from "./pages/menubar/PageRenderer";

// import Dashboard from "./pages/Dashboard"; //for multiple role profiles

//Connections/Friends
import FriendsPage from "./pages/connection/FriendsPage";
import RequestsPage from "./pages/connection/RequestsPage";

import HomePage from "./pages/home.page";
import UserAuthForm from "./pages/userAuthForm.page";
import Editor from "./pages/editor.pages";
import SearchPage from "./pages/search.page";
import ProfilePage from "./pages/profile/profile.page";
import BlogPage from "./pages/blog.page";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/profile/edit-profile.page";
import Notification from "./pages/notifications.page";
import MyBlogs from "./pages/manage-blogs.page";
import ForgotPasswordPage from "./pages/forgot-password.page";
import ResetPasswordPage from "./pages/reset-password.page";
import PageNotFound from "./pages/404.page";

export const UserContext = createContext({
  userAuth: { access_token: null },
  setUserAuth: () => {},
});

//  Protected Route
const ProtectedRoute = ({ user, children }) => {
  if (!user.access_token) return <Navigate to="/signin" replace />;
  return children;
};

const App = () => {
  const [userAuth, setUserAuth] = useState(() => {
    const sessionUser = lookInSession("user");
    return sessionUser && sessionUser.access_token
      ? sessionUser
      : { access_token: null };
  });
  const location = useLocation();
  const [pageState, setPageState] = useState("home");

  const loadBlogByCategory = (category) => {
    setPageState((prev) => (prev === category ? "home" : category));
  };

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* ================= ADMIN (FULLY SEPARATE) ================= */}
        <Route path="/admin" element={<AdminAppLayout />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />

              {/* NEW */}
              <Route path="roles">
                <Route index element={<Navigate to="requests" />} />
                <Route path="requests" element={<AdminRoles />} />
                <Route path="manage" element={<AdminRolePanel />} />
              </Route>

              <Route path="blogs" element={<AdminBlogs />} />

              <Route path="finance" element={<AdminFinance />} />
              <Route
                path="finance/expenditures"
                element={<AdminExpenditures />}
              />
              <Route path="finance/balance" element={<AdminBalance />} />
            </Route>
          </Route>
        </Route>

        {/* ================= USER APP ================= */}
        <Route
          path="/"
          element={
            <AppLayout
              loadBlogByCategory={loadBlogByCategory}
              pageState={pageState}
            />
          }
        >
          <Route
            path="onboarding"
            element={
              <ProtectedRoute user={userAuth}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            index
            element={
              <HomePage
                key={pageState}
                pageState={pageState}
                setPageState={setPageState}
              />
            }
          />
          {/* for multiple roles profiles  disabled */}
          {/* <Route path="dashboard-home" element={<Dashboard />} /> */}
          <Route
            path="/editor"
            element={
              <ProtectedRoute user={userAuth}>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/welcome"
            element={
              <ProtectedRoute user={userAuth}>
                {!userAuth?.isOnboardingCompleted ? (
                  <WelcomePage />
                ) : (
                  <Navigate to="/" />
                )}
              </ProtectedRoute>
            }
          />

          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route path="search/:query" element={<SearchPage />} />
          <Route path="user/:id" element={<ProfilePage />} />
          <Route path="blog/:blog_id" element={<BlogPage />} />
          {/* Auth */}
          <Route path="signin" element={<UserAuthForm type="sign-in" />} />
          <Route path="signup" element={<UserAuthForm type="sign-up" />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="chat">
            <Route index element={<ChatPage />} />

            {/*  OPEN BY CONVERSATION */}
            <Route path="conversation/:conversationId" element={<ChatPage />} />
          </Route>
          {/* Dashboard */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute user={userAuth}>
                <SideNav />
              </ProtectedRoute>
            }
          >
            <Route path="donor" element={<DonorDashboard />} />
            <Route index element={<div>Select a section</div>} />
            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="notifications" element={<Notification />} />
            <Route path="blogs" element={<MyBlogs />} />
            <Route path="academics">
              <Route index element={<AcademicPage />} />
              <Route path="add" element={<AcademicForm />} />
              <Route path="edit/:academic_id" element={<AcademicForm />} />
            </Route>
            <Route
              path="professional-profile"
              element={<ProfessionalProfile />}
            />
            <Route path="connections">
              <Route index element={<FriendsPage />} />
              <Route path="requests" element={<RequestsPage />} />
            </Route>
            <Route path="*" element={<div>Page not found</div>} />
          </Route>
          {/* Settings */}
          <Route
            path="settings"
            element={
              <ProtectedRoute user={userAuth}>
                <SideNav />
              </ProtectedRoute>
            }
          >
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          {/*  PageRenderer pages */}
          <Route path=":slug/*" element={<PageRenderer />} />

          {/*  404 fallback */}
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
