import EventTrackingVendor from "./EventTrackingVendor";

export default class GoogleAnalytics extends EventTrackingVendor {
  constructor() {
    super();
    this.enabled = true;
  }

  test() {
    return typeof (window as any).ga === "function";
  }

  track(eventName: string, eventProperties: Record<string, unknown>) {
    (window as any).ga(
      "send",
      "event",
      "All",
      eventName,
      null,
      null,
      eventProperties
    );
  }

  identify(userId: string) {
    (window as any).ga("set", "userId", userId);
  }

  page(path: string) {
    (window as any).ga("send", "pageview", path);
  }
}
