import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "../store";

interface Props {
  children: ReactNode;
}

const ReduxProvider = (props: Props) => {
  return (
    <Provider store={store}>
      <>{props.children}</>
    </Provider>
  );
};

export default ReduxProvider;
