import { Button } from "pace-frontend-test";

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

// The six variants. `white` is meant for dark hero backgrounds, so it is shown on navy.
export const Variants = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", padding: 8 }}>
    <Button variant="primary">Add Member</Button>
    <Button variant="secondary">Promote</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="ghost">Skip step</Button>
    <Button variant="danger">Remove</Button>
    <div style={{ background: "#0f1e3d", padding: 12, borderRadius: 8 }}>
      <Button variant="white">Get Started</Button>
    </div>
  </div>
);

// Three sizes.
export const Sizes = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 8 }}>
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

// Icons and stateful buttons.
export const IconsAndStates = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", padding: 8 }}>
    <Button variant="primary" leftIcon={<PlusIcon />}>Add Member</Button>
    <Button variant="secondary" rightIcon={<ArrowIcon />}>Continue</Button>
    <Button variant="primary" loading>Saving</Button>
    <Button variant="primary" disabled>Disabled</Button>
  </div>
);
