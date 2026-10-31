import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import Login from "../../../../src/components/authentication/login/Login";
import { LoginPresenter } from "../../../../src/presenter/LoginPresenter";

library.add(fab);

const alias = "@testUser";
const password = "password1234";
const originalUrl = "/feed/@testUser";

const renderLogin = (presenter?: LoginPresenter) => {
  return render(
    <MemoryRouter>
      {presenter ? (
        <Login originalUrl={originalUrl} presenter={presenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>
  );
};

const renderLoginAndGetElements = (presenter?: LoginPresenter) => {
  const user = userEvent.setup();

  renderLogin(presenter);

  const signInButton = screen.getByRole("button", { name: /^Sign in$/i });
  const aliasField = screen.getByLabelText("Alias");
  const passwordField = screen.getByLabelText("Password");

  return { user, signInButton, aliasField, passwordField };
};

describe("Login Component", () => {
  test("starts with the sign-in button disabled", () => {
    const { signInButton } = renderLoginAndGetElements();

    expect(signInButton).toBeDisabled();
  });

  test("enables the sign-in button when both fields have text", async () => {
    const { user, signInButton, aliasField, passwordField } =
      renderLoginAndGetElements();

    await user.type(aliasField, alias);
    await user.type(passwordField, password);

    expect(signInButton).toBeEnabled();
  });

  test("disables the sign-in button when either field is cleared", async () => {
    const { user, signInButton, aliasField, passwordField } =
      renderLoginAndGetElements();

    await user.type(aliasField, alias);
    await user.type(passwordField, password);
    expect(signInButton).toBeEnabled();

    await user.clear(aliasField);
    expect(signInButton).toBeDisabled();

    await user.type(aliasField, alias);
    expect(signInButton).toBeEnabled();

    await user.clear(passwordField);
    expect(signInButton).toBeDisabled();
  });

  test("calls login with the correct parameters", async () => {
    const mockPresenter = mock<LoginPresenter>();
    const { user, signInButton, aliasField, passwordField } =
      renderLoginAndGetElements(instance(mockPresenter));

    await user.type(aliasField, alias);
    await user.type(passwordField, password);
    await user.click(signInButton);

    verify(mockPresenter.doLogin(alias, password, false, originalUrl)).once();
  });
});