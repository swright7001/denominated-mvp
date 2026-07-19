export const walkthroughSteps = [
  {
    id: "calculate",
    eyebrow: "1. Run a scenario",
    title: "Start with a real-life expense",
    description:
      "Enter today's cost, Bitcoin price, time horizon, and assumptions. The results update without hiding the inputs that produced them.",
    image: "/walkthrough-calculator.jpg",
    imageAlt:
      "Denominated calculator showing Tesla Model 3 inputs and dollar and Bitcoin results",
  },
  {
    id: "compare",
    eyebrow: "2. Explore examples",
    title: "Compare costs people recognize",
    description:
      "Open common scenarios such as housing, rent, childcare, elder care, and tuition to see the same purchasing-power framework applied consistently.",
    image: "/walkthrough-examples.jpg",
    imageAlt:
      "Denominated examples page showing common consumer purchasing-power scenarios",
  },
  {
    id: "understand",
    eyebrow: "3. Understand the result",
    title: "Keep assumptions separate from predictions",
    description:
      "Plain-English lessons explain nominal value, purchasing power, and opportunity cost without turning the experience into a trading screen.",
    image: "/walkthrough-learn.jpg",
    imageAlt:
      "Denominated learn page explaining purchasing power in plain English",
  },
] as const;

export type WalkthroughStepId = (typeof walkthroughSteps)[number]["id"];
