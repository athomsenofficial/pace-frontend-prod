// Design-system barrel entry for /design-sync (claude.ai/design import).
// Re-exports the reusable UI primitives from src/components/ui so the converter
// can bundle exactly these into window.PaceUI. Compound sub-parts (CardHeader,
// table cells, …) ship in the bundle for composition but are not separate cards.
export { Badge } from "./components/ui/Badge";
export { Button } from "./components/ui/Button";
export { Card, CardHeader, CardBody, CardFooter } from "./components/ui/Card";
export { Input } from "./components/ui/Input";
export { Modal } from "./components/ui/Modal";
export { Select } from "./components/ui/Select";
export { Table, THead, TBody, TR, TH, TD } from "./components/ui/Table";
export { Tabs } from "./components/ui/Tabs";
