import { MessageView, Presenter } from "./Presenter";

export interface ProgressView extends MessageView {
  setIsLoading: (isLoading: boolean) => void;
}

export abstract class ProgressPresenter<V extends ProgressView> extends Presenter<V> {
  // Function as parameter
  protected async doProgressReportingOperation(
    operation: () => Promise<void>,
    progressMessage: string,
    operationDescription: string
  ): Promise<void> {
    let progressToastId = "";

    await this.doFailureReportingOperation(
      async () => {
        this.view.setIsLoading(true);
        progressToastId = this.view.displayInfoMessage(progressMessage, 0);

        await operation();
      },
      operationDescription,
      () => {
        this.view.deleteMessage(progressToastId);
        this.view.setIsLoading(false);
      }
    );
  }
}