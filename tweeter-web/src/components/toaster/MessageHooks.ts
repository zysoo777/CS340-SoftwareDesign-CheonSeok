import { useContext } from "react";
import { ToastActionsContext, ToastListContext } from "./ToastContexts";

export const useMessageActions = () => {
  return useContext(ToastActionsContext);
};

export const useMessageList = () => {
  return useContext(ToastListContext);
};