import { addCollection } from "@iconify/vue";
import type { IconifyJSON } from "@iconify/types";

export type LocalIconifyPrefix = "ri" | "mdi" | "ion";

export type IconsJson = IconifyJSON;

const localPrefixes = new Set<string>(["ri", "mdi", "ion"]);
const localIconifyLoadPromises = new Map<LocalIconifyPrefix, Promise<IconsJson>>();

export const isLocalIconifyPrefix = (
  prefix: string,
): prefix is LocalIconifyPrefix => localPrefixes.has(prefix);

const resolveIconsJson = (module: unknown): IconsJson => {
  if (module && typeof module === "object" && "default" in module) {
    return (module as { default: IconsJson }).default;
  }
  return module as IconsJson;
};

export const loadLocalIconifySet = (prefix: LocalIconifyPrefix) => {
  const cached = localIconifyLoadPromises.get(prefix);
  if (cached) {
    return cached;
  }

  const promise = (async () => {
    let module: unknown;

    if (prefix === "ri") {
      module = await import("@iconify-json/ri/icons.json");
    } else if (prefix === "mdi") {
      module = await import("@iconify-json/mdi/icons.json");
    } else {
      module = await import("@iconify-json/ion/icons.json");
    }

    const iconsJson = resolveIconsJson(module);
    addCollection(iconsJson);
    return iconsJson;
  })();

  localIconifyLoadPromises.set(prefix, promise);
  return promise;
};
