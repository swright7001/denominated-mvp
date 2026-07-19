export const publicSupportEmail = "support@getdenominated.com";

export function getConfiguredSupportEmail(
  value = process.env.DENOMINATED_SUPPORT_EMAIL,
  verified = process.env.DENOMINATED_SUPPORT_EMAIL_VERIFIED,
) {
  return value?.trim().toLowerCase() === publicSupportEmail &&
    verified?.trim().toLowerCase() === "true"
    ? publicSupportEmail
    : null;
}
