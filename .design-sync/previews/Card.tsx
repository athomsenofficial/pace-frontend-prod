import { Card, CardHeader, CardBody, CardFooter, Button, Badge } from "pace-frontend-test";

// Full compound card: header with title + status, a body, and a footer with actions.
export const MemberDetail = () => (
  <div style={{ padding: 12, maxWidth: 440 }}>
    <Card>
      <CardHeader>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="font-heading" style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#0f1e3d" }}>
            Promotion Eligibility
          </h3>
          <Badge color="green">Eligible</Badge>
        </div>
      </CardHeader>
      <CardBody>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 20px", margin: 0, fontSize: 14 }}>
          <dt style={{ color: "#64748b" }}>Name</dt>
          <dd style={{ margin: 0, fontWeight: 500, color: "#0f172a" }}>SMITH, JOHN A.</dd>
          <dt style={{ color: "#64748b" }}>Grade</dt>
          <dd style={{ margin: 0, color: "#0f172a" }}>SSgt &rarr; TSgt</dd>
          <dt style={{ color: "#64748b" }}>DAFSC</dt>
          <dd style={{ margin: 0, fontFamily: "ui-monospace, monospace", color: "#0f172a" }}>3D0X2</dd>
          <dt style={{ color: "#64748b" }}>Date of Rank</dt>
          <dd style={{ margin: 0, color: "#0f172a" }}>01 Mar 2021</dd>
        </dl>
      </CardBody>
      <CardFooter>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="primary" size="sm">Approve</Button>
        </div>
      </CardFooter>
    </Card>
  </div>
);

// The base container on its own — just border, rounding, and shadow.
export const Basic = () => (
  <div style={{ padding: 12, maxWidth: 440 }}>
    <Card>
      <CardBody>
        <p style={{ margin: 0, fontSize: 14, color: "#334155" }}>
          A plain card with a single body region. Compose <code>CardHeader</code>,{" "}
          <code>CardBody</code>, and <code>CardFooter</code> to build richer layouts.
        </p>
      </CardBody>
    </Card>
  </div>
);
