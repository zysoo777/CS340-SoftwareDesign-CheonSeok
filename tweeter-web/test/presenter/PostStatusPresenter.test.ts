import { AuthToken, User } from "tweeter-shared";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { PostStatusPresenter, PostStatusView } from "../../src/presenter/PostStatusPresenter";
import { StatusService } from "../../src/model/service/StatusService";

describe("PostStatusPresenter", () => {
  let mockView: PostStatusView;
  let presenter: PostStatusPresenter;
  let mockStatusService: StatusService;

  const authToken = new AuthToken("abc123", Date.now());
  const currentUser = new User("First", "Last", "@alias", "imageUrl");
  const post = "Hello, world!";
  const postingMessageId = "postingMessageId";

  beforeEach(() => {
    mockView = mock<PostStatusView>();
    // displayInfoMessage returns the id of the toast it shows
    when(mockView.displayInfoMessage(anything(), anything())).thenReturn(
      postingMessageId
    );

    const presenterSpy = spy(new PostStatusPresenter(instance(mockView)));
    presenter = instance(presenterSpy);

    mockStatusService = mock<StatusService>();
    when(presenterSpy.statusService).thenReturn(instance(mockStatusService));
  });

  test("displays a posting status message", async () => {
    await presenter.submitPost(post, currentUser, authToken);

    verify(mockView.displayInfoMessage("Posting status...", 0)).once();
  });

  test("calls postStatus with the correct status and auth token", async () => {
    await presenter.submitPost(post, currentUser, authToken);

    verify(mockStatusService.postStatus(anything(), anything())).once();

    const [capturedAuthToken, capturedStatus] = capture(
      mockStatusService.postStatus
    ).last();
    expect(capturedAuthToken).toEqual(authToken);
    expect(capturedStatus.post).toEqual(post);
  });

  test("handles a successful post", async () => {
    await presenter.submitPost(post, currentUser, authToken);

    verify(mockView.deleteMessage(postingMessageId)).once();
    verify(mockView.setPost("")).once();
    verify(mockView.displayInfoMessage("Status posted!", 2000)).once();
    verify(mockView.displayErrorMessage(anything())).never();
  });

  test("handles a failed post", async () => {
    const error = new Error("Post failed");
    when(mockStatusService.postStatus(anything(), anything())).thenThrow(error);

    await presenter.submitPost(post, currentUser, authToken);

    verify(mockView.deleteMessage(postingMessageId)).once();
    verify(
      mockView.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`
      )
    ).once();
    verify(mockView.setPost(anything())).never();
    verify(mockView.displayInfoMessage("Status posted!", anything())).never();
  });
});