import { MelWizard } from "@/features/mel/MelWizard";

const FINAL_CYCLES = [
  { value: "SRA", label: "Senior Airman (SRA)" },
  { value: "SSG", label: "Staff Sergeant (SSG)" },
  { value: "TSG", label: "Technical Sergeant (TSG)" },
  { value: "MSG", label: "Master Sergeant (MSG)" },
  { value: "SMS", label: "Senior Master Sergeant (SMS)" },
  { value: "CMS", label: "Chief Master Sergeant (CMS)" },
];

export default function FinalMel() {
  return (
    <MelWizard
      type="final-mel"
      title="Final Master Eligibility Listing"
      documentLabel="Final Master Eligibility Listing"
      filenamePrefix="final_mel"
      cycles={FINAL_CYCLES}
    />
  );
}
