export const siteConfig = {
  name: "Denominated",
  tagline: "Measure life in purchasing power.",
  title: "Denominated | Measure life in purchasing power",
  description:
    "A consumer purchasing-power calculator for comparing everyday expenses in dollars and Bitcoin over time.",
  url: "https://getdenominated.com",
  ogImage: "/brand/logo.png",
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
