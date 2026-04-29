import { routeProEn } from "./en";
import { routeProIt } from "./it";

export type RouteProLocale = "it" | "en";

export function getRouteProDictionary(locale: RouteProLocale = "it") {
  if (locale === "en") {
    return routeProEn;
  }

  return routeProIt;
}