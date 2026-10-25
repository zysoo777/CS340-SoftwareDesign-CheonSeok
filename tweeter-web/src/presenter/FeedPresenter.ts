import { AuthToken, Status } from "tweeter-shared";
import { PAGE_SIZE } from "./PagedPresenter";
import { PagedStatusItemPresenter } from "./PagedStatusItemPresenter";

export class FeedPresenter extends PagedStatusItemPresenter {
  protected getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[Status[], boolean]> {
    return this.service.loadMoreFeedItems(
      authToken,
      userAlias,
      PAGE_SIZE,
      this.lastItem
    );
  }

  protected getItemDescription(): string {
    return "load feed items";
  }
}
