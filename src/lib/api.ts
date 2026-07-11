import type { ScenarioInput } from "./types";
export { getBTCPrice } from "./btc-price";
export { sendWeeklyReportEmail as sendEmailReport } from "./weekly-report-email";

const notImplemented = async () => {
  throw new Error("Placeholder only. External APIs are not implemented in the MVP.");
};

export const getVehiclePrice = notImplemented;
export const getHousingPrice = notImplemented;
export const getElderCarePrice = notImplemented;
export const getTuitionPrice = notImplemented;
export const getStockPrice = notImplemented;
export const getInflationData = notImplemented;

export async function saveScenario(scenario: ScenarioInput) {
  void scenario;
  return notImplemented();
}

export async function getSavedScenario(id: string) {
  void id;
  return notImplemented();
}

export async function createShareLink(scenario: ScenarioInput) {
  void scenario;
  return notImplemented();
}

export async function createStripeCheckoutSession(priceId: string) {
  void priceId;
  return notImplemented();
}
