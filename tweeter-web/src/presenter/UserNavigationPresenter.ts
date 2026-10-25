import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";
import { Presenter, View } from "./Presenter";

export interface UserNavigationView extends View {
  setDisplayedUser: (user: User) => void;
  navigateTo: (url: string) => void;
}

export class UserNavigationPresenter extends Presenter<UserNavigationView> {
  private userService = new UserService();

  public async navigateToUser(
    eventTarget: string,
    featurePath: string,
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(eventTarget);

      const toUser = await this.userService.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigateTo(`${featurePath}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  private extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}