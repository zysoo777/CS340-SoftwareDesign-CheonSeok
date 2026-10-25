import { AuthToken, User } from "tweeter-shared";
import { Service } from "../model/service/Service";
import { UserService } from "../model/service/UserService";
import { Presenter, View } from "./Presenter";

export const PAGE_SIZE = 10;

export interface PagedItemView<T> extends View {
  addItems: (newItems: T[]) => void;
}

// Generics: T is the item type (User or Status), U is the service that loads it
export abstract class PagedPresenter<T, U extends Service> extends Presenter<
  PagedItemView<T>
> {
  private _service: U;
  private _hasMoreItems = true;
  private _lastItem: T | null = null;
  private userService = new UserService();

  public constructor(view: PagedItemView<T>) {
    super(view);
    this._service = this.createService();
  }

  protected get service(): U {
    return this._service;
  }

  public get hasMoreItems(): boolean {
    return this._hasMoreItems;
  }

  protected get lastItem(): T | null {
    return this._lastItem;
  }

  public reset() {
    this._lastItem = null;
    this._hasMoreItems = true;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    return this.userService.getUser(authToken, alias);
  }

  // Template method: subclasses supply getMoreItems() and getItemDescription()
  public async loadMoreItems(authToken: AuthToken, userAlias: string) {
    await this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.getMoreItems(authToken, userAlias);

      this._hasMoreItems = hasMore;
      this._lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, this.getItemDescription());
  }

  protected abstract createService(): U;

  protected abstract getMoreItems(
    authToken: AuthToken,
    userAlias: string
  ): Promise<[T[], boolean]>;

  protected abstract getItemDescription(): string;
}