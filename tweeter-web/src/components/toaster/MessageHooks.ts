import { useContext } from "react";
import { ToastActionsContext, ToastListContext } from "./ToastContexts";
import { ToastType } from "./Toast";
import { MessageView } from "../../presenter/Presenter";

export const useMessageActions = () => {
  return useContext(ToastActionsContext);
};

export const useMessageList = () => {
  return useContext(ToastListContext);
};

// Hook creation: every listener shows presenter messages as toasts the same way
export const useMessageListener = (): MessageView => {
  const { displayToast, deleteToast } = useMessageActions();

  return {
    displayErrorMessage: (message: string) => {
      displayToast(ToastType.Error, message, 0);
    },
    displayInfoMessage: (message: string, duration: number) =>
      displayToast(ToastType.Info, message, duration),
    deleteMessage: (messageId: string) => deleteToast(messageId),
  };
};
