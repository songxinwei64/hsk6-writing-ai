export function isLemonTestMode() {
  return process.env.LEMONSQUEEZY_TEST_MODE === "true";
}

export function matchesLemonEnvironment(testMode: boolean | null | undefined) {
  return typeof testMode === "boolean" && testMode === isLemonTestMode();
}
