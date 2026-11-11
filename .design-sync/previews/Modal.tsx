import { Modal, Button, Input, Select } from "pace-frontend-test";

const grades = [
  { value: "SrA", label: "SrA" },
  { value: "SSgt", label: "SSgt" },
  { value: "TSgt", label: "TSgt" },
];

// The Add Member dialog: title, description, a two-field body, and a footer with actions.
// The wrapper establishes a containing block (transform) with explicit height so the
// modal's `fixed inset-0` overlay sizes to it and the dialog is fully visible in the card.
export const AddMember = () => (
  <div style={{ transform: "translateZ(0)", position: "relative", minHeight: 440 }}>
    <Modal
      open
      onClose={() => {}}
      title="Add Member"
      description="New member will be added to the roster and processed for eligibility."
      size="lg"
      footer={
        <>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Add Member</Button>
        </>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Input label="Full Name" placeholder="LAST, FIRST M." />
        <Select label="Grade" options={grades} defaultValue="SSgt" />
      </div>
    </Modal>
  </div>
);
