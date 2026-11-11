import { MelWizard } from "@/features/mel/MelWizard";

const INITIAL_CYCLES = [
  { value: "SRA", label: "Senior Airman (SRA)" },
  { value: "SSG", label: "Staff Sergeant (SSG)" },
  { value: "TSG", label: "Technical Sergeant (TSG)" },
  { value: "MSG", label: "Master Sergeant (MSG)" },
  { value: "SMS", label: "Senior Master Sergeant (SMS)" },
];

export default function InitialMel() {
  return (
    <MelWizard
      type="initial-mel"
      title="Initial Master Eligibility Listing"
      documentLabel="Initial Master Eligibility Listing"
      filenamePrefix="initial_mel"
      cycles={INITIAL_CYCLES}
    />
  );
}
