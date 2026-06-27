export const siteConfig = {
  name: "Denominated",
  tagline: "Measure life in purchasing power.",
  title: "Denominated | Measure life in purchasing power",
  description:
    "A consumer purchasing-power calculator for comparing everyday expenses in dollars and Bitcoin over time.",
  url: "https://denominated-mvp.vercel.app",
  ogImage: "/brand/logo.png",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function resolveRequestAppOrigin({
  requestUrl,
  configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL,
}: {
  requestUrl: string;
  configuredAppUrl?: string;
}) {
  const requestOrigin = new URL(requestUrl).origin;

  if (!configuredAppUrl) {
    return requestOrigin;
  }

  try {
    const configuredUrl = new URL(configuredAppUrl);
    const requestUrlObject = new URL(requestUrl);

    if (configuredUrl.host === requestUrlObject.host) {
      return configuredUrl.origin;
    }
  } catch {
    return requestOrigin;
  }

  return requestOrigin;
}
