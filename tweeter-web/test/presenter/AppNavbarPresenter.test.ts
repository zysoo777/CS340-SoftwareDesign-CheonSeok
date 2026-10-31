import { AuthToken } from "tweeter-shared";
import { anything, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { AppNavbarPresenter, AppNavbarView } from "../../src/presenter/AppNavbarPresenter";
import { UserService } from "../../src/model/service/UserService";

describe("AppNavbarPresenter", () => {
  let mockView: AppNavbarView;
  let presenter: AppNavbarPresenter;
  let mockUserService: UserService;

  const authToken = new AuthToken("abc123", Date.now());
  const loggingOutMessageId = "loggingOutMessageId";

  beforeEach(() => {
    mockView = mock<AppNavbarView>();
    // displayInfoMessage returns the id of the toast it shows
    when(mockView.displayInfoMessage(anything(), anything())).thenReturn(
      loggingOutMessageId
    );

    const presenterSpy = spy(new AppNavbarPresenter(instance(mockView)));
    presenter = instance(presenterSpy);

    mockUserService = mock<UserService>();
    when(presenterSpy.userService).thenReturn(instance(mockUserService));
  });

  test("displays a logging out message", async () => {
    await presenter.logOut(authToken);

    verify(mockView.displayInfoMessage("Logging Out...", 0)).once();
  });

  test("calls logout with the correct auth token", async () => {
    await presenter.logOut(authToken);

    verify(mockUserService.logout(authToken)).once();
  });

  test("handles a successful logout", async () => {
    await presenter.logOut(authToken);

    verify(mockView.deleteMessage(loggingOutMessageId)).once();
    verify(mockView.clearUserInfo()).once();
    verify(mockView.navigateTo("/login")).once();
    verify(mockView.displayErrorMessage(anything())).never();
  });

  test("handles a failed logout", async () => {
    const error = new Error("Logout failed");
    when(mockUserService.logout(anything())).thenThrow(error);

    await presenter.logOut(authToken);

    verify(
      mockView.displayErrorMessage(
        `Failed to log user out because of exception: ${error}`
      )
    ).once();
    verify(mockView.deleteMessage(anything())).never();
    verify(mockView.clearUserInfo()).never();
    verify(mockView.navigateTo(anything())).never();
  });
});