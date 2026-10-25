import { useNavigate } from "react-router-dom";
import { useMessageListener } from "../toaster/MessageHooks";
import { useUserInfo, useUserInfoActions } from "./UserInfoHooks";
import { usePresenter } from "../presenter/PresenterHooks";
import { UserNavigationPresenter, UserNavigationView } from "../../presenter/UserNavigationPresenter";

export const useUserNavigation = () => {
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const navigate = useNavigate();

  const listener: UserNavigationView = {
    ...useMessageListener(),
    setDisplayedUser,
    navigateTo: (url: string) => navigate(url),
  };
  const presenter = usePresenter(() => new UserNavigationPresenter(listener));

  const navigateToUser = async (
    event: React.MouseEvent,
    featurePath: string
  ): Promise<void> => {
    event.preventDefault();

    await presenter.navigateToUser(
      event.target.toString(),
      featurePath,
      authToken!,
      displayedUser!
    );
  };

  return { navigateToUser };
};