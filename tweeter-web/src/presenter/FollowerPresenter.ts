import { AuthToken, User } from "tweeter-shared";
import { PAGE_SIZE } from "./PagedPresenter";
import { PagedUserItemPresenter } from "./PagedUserItemPresenter";

export class FollowerPresenter extends PagedUserItemPresenter {
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[User[], boolean]> {
    return this.service.loadMoreFollowers(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }

  protected getItemDescription(): string {
    return "load followers";
  }
}
