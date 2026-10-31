import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model/service/StatusService";
import { ProgressPresenter, ProgressView } from "./ProgressPresenter";

export interface PostStatusView extends ProgressView {
  setPost: (post: string) => void;
}

export class PostStatusPresenter extends ProgressPresenter<PostStatusView> {
  private _statusService = new StatusService();

  // Public getter so tests can replace the service with a mock
  public get statusService(): StatusService {
    return this._statusService;
  }
  
  public async submitPost(
    post: string,
    currentUser: User,
    authToken: AuthToken
  ): Promise<void> {
    await this.doProgressReportingOperation(
      async () => {
        const status = new Status(post, currentUser, Date.now());

        await this.statusService.postStatus(authToken, status);

        this.view.setPost("");
        this.view.displayInfoMessage("Status posted!", 2000);
      },
      "Posting status...",
      "post the status"
    );
  }

  public clearPost(): void {
    this.view.setPost("");
  }

  public checkButtonStatus(
    post: string,
    authToken: AuthToken | null,
    currentUser: User | null,
    isLoading: boolean
  ): boolean {
    return !post.trim() || !authToken || !currentUser || isLoading;
  }
}