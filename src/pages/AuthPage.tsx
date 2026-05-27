import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/extensions/auth-email/useAuth";
import { LoginForm } from "@/components/extensions/auth-email/LoginForm";
import { RegisterForm } from "@/components/extensions/auth-email/RegisterForm";
import { ResetPasswordForm } from "@/components/extensions/auth-email/ResetPasswordForm";
import { UserProfile } from "@/components/extensions/auth-email/UserProfile";

const AUTH_URL = "https://functions.poehali.dev/f84d608c-3cfc-4ff8-804e-73864857369c";

type ViewType = "login" | "register" | "reset-password" | "profile";

export default function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewType>("login");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const auth = useAuth({
    apiUrls: {
      login: `${AUTH_URL}?action=login`,
      register: `${AUTH_URL}?action=register`,
      verifyEmail: `${AUTH_URL}?action=verify-email`,
      refresh: `${AUTH_URL}?action=refresh`,
      logout: `${AUTH_URL}?action=logout`,
      resetPassword: `${AUTH_URL}?action=reset-password`,
    },
  });

  const handleLoginSuccess = () => {
    setView("profile");
  };

  const handleLogout = async () => {
    await auth.logout();
    setView("login");
    setSuccessMessage(null);
  };

  const handlePasswordResetSuccess = () => {
    setSuccessMessage("Пароль успешно изменен! Войдите с новым паролем.");
    setView("login");
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (auth.isAuthenticated && auth.user && view === "profile") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <UserProfile user={auth.user} onLogout={handleLogout} className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {view === "login" && (
          <LoginForm
            onLogin={auth.login}
            onSuccess={handleLoginSuccess}
            onRegisterClick={() => {
              setSuccessMessage(null);
              setView("register");
            }}
            onForgotPasswordClick={() => {
              setSuccessMessage(null);
              setView("reset-password");
            }}
            error={auth.error}
            successMessage={successMessage}
            isLoading={auth.isLoading}
          />
        )}

        {view === "register" && (
          <RegisterForm
            onRegister={auth.register}
            onVerifyEmail={auth.verifyEmail}
            onLoginClick={() => {
              setSuccessMessage(null);
              setView("login");
            }}
            onSuccess={handleLoginSuccess}
            error={auth.error}
            isLoading={auth.isLoading}
          />
        )}

        {view === "reset-password" && (
          <ResetPasswordForm
            onRequestReset={auth.requestPasswordReset}
            onResetPassword={auth.resetPassword}
            onLoginClick={() => {
              setSuccessMessage(null);
              setView("login");
            }}
            onSuccess={handlePasswordResetSuccess}
            error={auth.error}
            isLoading={auth.isLoading}
          />
        )}
      </div>
    </div>
  );
}