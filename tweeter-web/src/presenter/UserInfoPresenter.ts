import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../model/service/FollowService";
import { ProgressPresenter, ProgressView } from "./ProgressPresenter";

export interface UserInfoView extends ProgressView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setDisplayedUser: (user: User) => void;
  navigateTo: (url: string) => void;
}

export class UserInfoPresenter extends ProgressPresenter<UserInfoView> {
  private followService = new FollowService();

  public async loadUserInfo(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ): Promise<void> {
    await Promise.all([
      this.setIsFollowerStatus(authToken, currentUser, displayedUser),
      this.setNumbFollowees(authToken, displayedUser),
      this.setNumbFollowers(authToken, displayedUser),
    ]);
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken,
            currentUser,
            displayedUser
          )
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.loadCount(
      () => this.followService.getFolloweeCount(authToken, displayedUser),
      (count) => this.view.setFolloweeCount(count),
      "get followees count"
    );
  }

  public async setNumbFollowers(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.loadCount(
      () => this.followService.getFollowerCount(authToken, displayedUser),
      (count) => this.view.setFollowerCount(count),
      "get followers count"
    );
  }

  // Function as parameter: both counts are fetched and shown the same way
  private async loadCount(
    getCount: () => Promise<number>,
    showCount: (count: number) => void,
    operationDescription: string
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      showCount(await getCount());
    }, operationDescription);
  }

  public switchToLoggedInUser(currentUser: User, currentPath: string): void {
    this.view.setDisplayedUser(currentUser);
    this.view.navigateTo(
      `${this.getBaseUrl(currentPath)}/${currentUser.alias}`
    );
  }

  private getBaseUrl(currentPath: string): string {
    const segments = currentPath.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.changeFollowStatus(
      () => this.followService.follow(authToken, displayedUser),
      true,
      `Following ${displayedUser.name}...`,
      "follow user"
    );
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User
  ): Promise<void> {
    await this.changeFollowStatus(
      () => this.followService.unfollow(authToken, displayedUser),
      false,
      `Unfollowing ${displayedUser.name}...`,
      "unfollow user"
    );
  }

  // Function as parameter: follow and unfollow differ only in the service call and new state
  private async changeFollowStatus(
    followOperation: () => Promise<[number, number]>,
    isFollower: boolean,
    progressMessage: string,
    operationDescription: string
  ): Promise<void> {
    await this.doProgressReportingOperation(
      async () => {
        const [followerCount, followeeCount] = await followOperation();

        this.view.setIsFollower(isFollower);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
      },
      progressMessage,
      operationDescription
    );
  }
}