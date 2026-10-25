import { useNavigate } from "react-router-dom";
import { useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useMessageListener } from "../toaster/MessageHooks";
import { AuthenticationView } from "../../presenter/AuthenticationPresenter";

// Hook creation: the view operations Login and Register both give their presenter
export const useAuthenticationListener = (
  setIsLoading: (isLoading: boolean) => void
): AuthenticationView => {
  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();

  return {
    ...useMessageListener(),
    setIsLoading,
    updateUserInfo,
    navigateTo: (url: string) => navigate(url),
  };
};