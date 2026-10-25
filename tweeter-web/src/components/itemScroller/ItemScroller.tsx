import { Fragment, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { useUserInfo, useUserInfoActions } from "../userInfo/UserInfoHooks";
import { useMessageListener } from "../toaster/MessageHooks";
import { usePresenter } from "../presenter/PresenterHooks";
import { PagedItemView, PagedPresenter } from "../../presenter/PagedPresenter";
import { Service } from "../../model/service/Service";

interface Props<T, U extends Service> {
  featurePath: string;
  presenterFactory: (view: PagedItemView<T>) => PagedPresenter<T, U>;
  // Function as parameter: the caller decides how one item (user or status) is rendered
  itemComponentFactory: (item: T, featurePath: string) => JSX.Element;
}

const ItemScroller = <T, U extends Service>(props: Props<T, U>) => {
  const [items, setItems] = useState<T[]>([]);

  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PagedItemView<T> = {
    ...useMessageListener(),
    addItems: (newItems: T[]) =>
      setItems((previousItems) => [...previousItems, ...newItems]),
  };
  const presenter = usePresenter(() => props.presenterFactory(listener));

  // Update the displayed user context variable whenever the displayedUser url parameter changes.
  // This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      presenter
        .getUser(authToken, displayedUserAliasParam)
        .then((toUser) => {
          if (toUser) {
            setDisplayedUser(toUser);
          }
        });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = () => {
    setItems(() => []);
    presenter.reset();
  };

  const loadMoreItems = () => {
    presenter.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={loadMoreItems}
        hasMore={presenter.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            {props.itemComponentFactory(item, props.featurePath)}
          </Fragment>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;