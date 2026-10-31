import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { AuthToken, User } from "tweeter-shared";
import PostStatus from "../../../src/components/postStatus/PostStatus";
import { PostStatusPresenter } from "../../../src/presenter/PostStatusPresenter";
import { useUserInfo } from "../../../src/components/userInfo/UserInfoHooks";

// From instruction: Replace useUserInfo with a jest mock. So the component gets a user and auth token.
jest.mock("../../../src/components/userInfo/UserInfoHooks", () => ({
  ...jest.requireActual("../../../src/components/userInfo/UserInfoHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

const post = "Hello, world!";

describe("PostStatus Component", () => {
  const mockUserInstance = instance(mock<User>());
  const mockAuthTokenInstance = instance(mock<AuthToken>());

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  const renderPostStatusAndGetElements = (presenter?: PostStatusPresenter) => {
    const user = userEvent.setup();

    render(
      presenter ? <PostStatus presenter={presenter} /> : <PostStatus />
    );

    const postStatusButton = screen.getByRole("button", {
      name: /Post Status/i,
    });
    const clearButton = screen.getByRole("button", { name: /Clear/i });
    const postField = screen.getByPlaceholderText("What's on your mind?");

    return { user, postStatusButton, clearButton, postField };
  };

  test("starts with both buttons disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();

    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  test("enables both buttons when the field has text", async () => {
    const { user, postStatusButton, clearButton, postField } =
      renderPostStatusAndGetElements();

    await user.type(postField, post);

    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  test("disables both buttons when the field is cleared", async () => {
    const { user, postStatusButton, clearButton, postField } =
      renderPostStatusAndGetElements();

    await user.type(postField, post);
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(postField);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  test("calls postStatus with the correct parameters", async () => {
    const mockPresenter = mock<PostStatusPresenter>();
    const { user, postStatusButton, postField } =
      renderPostStatusAndGetElements(instance(mockPresenter));

    await user.type(postField, post);
    await user.click(postStatusButton);

    verify(
      mockPresenter.submitPost(post, mockUserInstance, mockAuthTokenInstance)
    ).once();
  });
});