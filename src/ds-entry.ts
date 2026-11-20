// Design-system barrel entry for /design-sync (claude.ai/design import).
// Re-exports the reusable UI primitives from src/components/ui so the converter
// can bundle exactly these into window.PaceUI. Compound sub-parts (CardHeader,
// table cells, …) ship in the bundle for composition but are not separate cards.
export { Alert } from "./components/ui/Alert";
export { Badge } from "./components/ui/Badge";
export { Button } from "./components/ui/Button";
export { Card, CardHeader, CardBody, CardFooter } from "./components/ui/Card";
export { EmptyState } from "./components/ui/EmptyState";
export { Field } from "./components/ui/Field";
export { FileDropzone } from "./components/ui/FileDropzone";
export { Input } from "./components/ui/Input";
export { Modal } from "./components/ui/Modal";
export { PageHeader } from "./components/ui/PageHeader";
export { Select } from "./components/ui/Select";
export { SmartDateInput } from "./components/ui/SmartDateInput";
export { Spinner } from "./components/ui/Spinner";
export { Stat } from "./components/ui/Stat";
export { Stepper } from "./components/ui/Stepper";
export { Table, THead, TBody, TR, TH, TD } from "./components/ui/Table";
export { Tabs } from "./components/ui/Tabs";
export { Textarea } from "./components/ui/Textarea";
