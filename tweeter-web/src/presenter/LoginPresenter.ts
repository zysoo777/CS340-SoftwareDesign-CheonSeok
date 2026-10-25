import { AuthenticationPresenter, AuthenticationView } from "./AuthenticationPresenter";

export interface LoginView extends AuthenticationView {}

export class LoginPresenter extends AuthenticationPresenter<LoginView> {
  public checkSubmitButtonStatus(alias: string, password: string): boolean {
    return !alias || !password;
  }

  public async doLogin(
    alias: string,
    password: string,
    rememberMe: boolean,
    originalUrl?: string
  ): Promise<void> {
    await this.doAuthenticationOperation(
      () => this.userService.login(alias, password),
      (user) => this.view.navigateTo(originalUrl || `/feed/${user.alias}`),
      rememberMe,
      "log user in"
    );
  }
}