import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../model/service/UserService";

export interface UserNavigationView {
  setDisplayedUser: (user: User) => void;
  navigateTo: (url: string) => void;
  displayErrorMessage: (message: string) => void;
}

export class UserNavigationPresenter {
  private view: UserNavigationView;
  private userService: UserService;

  public constructor(view: UserNavigationView) {
    this.view = view;
    this.userService = new UserService();
  }

  public async navigateToUser(
    eventTarget: string,
    featurePath: string,
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    try {
      const alias = this.extractAlias(eventTarget);

      const toUser = await this.userService.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigateTo(`${featurePath}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`
      );
    }
  }

  private extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
