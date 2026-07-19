export function isMultiCurrencyEnabled() {
  return process.env.DENOMINATED_ENABLE_MULTI_CURRENCY === "true";
}
