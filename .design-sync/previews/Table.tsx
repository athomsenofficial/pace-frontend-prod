import { Table, THead, TBody, TR, TH, TD, Badge } from "pace-frontend-test";

const rows = [
  { name: "SMITH, JOHN A.", grade: "SSgt", dafsc: "3D0X2", dor: "01 Mar 2021", pas: "FV4407", status: "green", label: "Eligible" },
  { name: "JOHNSON, MARIA L.", grade: "SrA", dafsc: "1N0X1", dor: "15 Jul 2022", pas: "FV4407", status: "amber", label: "Needs Review" },
  { name: "WILLIAMS, DAVID R.", grade: "TSgt", dafsc: "2A3X3", dor: "09 Nov 2019", pas: "FV4412", status: "red", label: "Ineligible" },
  { name: "BROWN, ASHLEY N.", grade: "SSgt", dafsc: "3F5X1", dor: "22 Feb 2021", pas: "FV4407", status: "green", label: "Eligible" },
];

// The roster review table — the primary use of Table in the app.
export const RosterReview = () => (
  <div style={{ padding: 8 }}>
    <Table>
      <THead>
        <TR>
          <TH>Name</TH>
          <TH>Grade</TH>
          <TH>DAFSC</TH>
          <TH>DOR</TH>
          <TH>PAS</TH>
          <TH>Status</TH>
        </TR>
      </THead>
      <TBody>
        {rows.map((m) => (
          <TR key={m.name}>
            <TD className="font-medium text-slate-900">{m.name}</TD>
            <TD>{m.grade}</TD>
            <TD className="font-mono text-xs">{m.dafsc}</TD>
            <TD>{m.dor}</TD>
            <TD className="font-mono text-xs">{m.pas}</TD>
            <TD>
              <Badge color={m.status as "green" | "amber" | "red"}>{m.label}</Badge>
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  </div>
);
