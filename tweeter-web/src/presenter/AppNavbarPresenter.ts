import { AuthToken } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { MessageView, Presenter } from "./Presenter";

export interface AppNavbarView extends MessageView {
  clearUserInfo: () => void;
  navigateTo: (url: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private userService = new UserService();

  public async logOut(authToken: AuthToken): Promise<void> {
    const loggingOutToastId = this.view.displayInfoMessage(
      "Logging Out...",
      0
    );

    await this.doFailureReportingOperation(async () => {
      await this.userService.logout(authToken);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigateTo("/login");
    }, "log user out");
  }
}