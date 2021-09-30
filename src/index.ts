import { snakeCase } from "./snakecase";
import EventTrackingVendor from "./vendor/EventTrackingVendor";
import GoogleAnalytics from "./vendor/GoogleAnalytics";

type AnalyticsVendor = {
  enabled: boolean;
  test: () => boolean;
};

type Dispatch = {
  type: string;
  page: string;
  subject: string;
  modifier: string;
  action: string;
  path: string;
  id: string;
  branchName: string;
  userId: string;
};

export default class EventTracking {
  private adapters: AnalyticsVendor[] = [];
  private identified = false;
  dataLayer = [];

  registerAdapter(adapter: EventTrackingVendor) {
    this.adapters.push(adapter);
  }

  log(...rest) {
    if (process.env.NODE_ENV === "production") return;
    console &&
      console.info &&
      console.info(
        "%c🦄 事件埋点",
        "background: #222; color: #bada55; padding:4px;",
        rest
      );
  }

  isIdentified() {
    return this.identified;
  }

  logout() {
    this.identified = false;
  }

  dispatch(
    { type, page, subject, modifier, action, ...props }: Partial<Dispatch>,
    ...rest
  ) {
    this.log("Dispatch", ...rest);

    const snakedProps = Object.entries(props).reduce(
      (a, b) => ({ ...a, [snakeCase(b[0])]: b[1] }),
      {}
    );

    switch (type) {
      case "page": {
        this.callAdapters(type, [props.path]);
        break;
      }
      case "track": {
        const eventName = this.buildEventName(page, subject, modifier, action);
        this.log(type, [eventName, snakedProps]);
        eventName !== null
          ? this.callAdapters(type, [eventName, snakedProps])
          : this.log("Failed to build event name", ...rest);
        break;
      }
      case "identify": {
        this.identified = this.callAdapters(type, [props.id, snakedProps]);
        break;
      }
      default: {
        console.log("Unknown option:", type);
      }
    }
  }

  buildEventName(page, subject, modifier, action) {
    if (
      typeof page === "undefined" ||
      typeof subject === "undefined" ||
      typeof action === "undefined"
    ) {
      return null;
    }

    return `${snakeCase(page)}.${snakeCase(subject)}${
      modifier ? "." + snakeCase(modifier) : ""
    }->${snakeCase(action)}`;
  }

  callAdapters(type, args) {
    if (args.length < 1) {
      this.log(`无法调用埋点适配器, 事件: ${type}, 没有参数`);
      return false;
    }

    this.adapters.forEach((adapter) => {
      if (process.env.NODE_ENV !== "production") {
        /** */
        console.log(" ⭐️ DEV MODE ⭐️");
        this.log(
          `触发 ${process.env.NODE_ENV} 事件埋点到 ${adapter.constructor.name} 在DEV MODE`,
          type,
          args
        );
      } else {
        if (
          adapter.enabled &&
          typeof adapter.test === "function" &&
          adapter.test()
        ) {
          adapter[type] && adapter[type](...args);
          this.log(
            `触发 ${process.env.NODE_ENV} 事件埋点到 ${adapter.constructor.name}`,
            type,
            args
          );
        } else {
          this.log(`触发事件埋点失败 ${adapter.constructor.name}!`, type, args);
        }
      }
    });

    return true;
  }
}
