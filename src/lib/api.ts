import { ScenarioInput } from "./types";

const notImplemented = async () => {
  throw new Error("Placeholder only. External APIs are not implemented in the MVP.");
};

export const getBTCPrice = notImplemented;
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

export async function sendEmailReport(email: string, scenario: ScenarioInput) {
  void email;
  void scenario;
  return notImplemented();
}

export async function createStripeCheckoutSession(priceId: string) {
  void priceId;
  return notImplemented();
}
