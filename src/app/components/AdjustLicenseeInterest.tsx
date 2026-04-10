import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { VotingRulesTabs } from "./VotingRulesTabs";

type LicenseeRow = {
  id: string;
  name: string;
  interest: string;
};

function formatSixDecimals(raw: string): string {
  const n = parseFloat(raw.replace(",", "."));
  if (Number.isNaN(n)) return "0.000000";
  return n.toFixed(6);
}

function sumInterestPercent(rows: LicenseeRow[]): number {
  return rows.reduce((acc, r) => {
    const n = parseFloat(String(r.interest).replace(",", "."));
    return acc + (Number.isNaN(n) ? 0 : n);
  }, 0);
}

export function AdjustLicenseeInterest() {
  const [rows, setRows] = useState<LicenseeRow[]>([
    { id: "1", name: "Petoro AS", interest: "30.000000" },
    { id: "2", name: "Equinor Energy AS", interest: "35.500000" },
    { id: "3", name: "Vår Energi ASA", interest: "12.250000" },
    { id: "4", name: "ConocoPhillips Skandinavia AS", interest: "8.125000" },
    { id: "5", name: "OMV (Norge) AS", interest: "14.125000" },
  ]);

  const total = useMemo(() => sumInterestPercent(rows), [rows]);
  const totalsHundred = Math.abs(total - 100) < 0.000001;

  const updateInterest = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, interest: value } : r)),
    );
  };

  const handleBlur = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, interest: formatSixDecimals(r.interest) } : r,
      ),
    );
  };

  const handleSave = () => {
    if (!totalsHundred) {
      alert(
        `Total interest must equal 100.000000%. Current sum: ${total.toFixed(6)}%.`,
      );
      return;
    }
    const payload = rows.map((r) => ({
      licensee: r.name,
      interestPercent: formatSixDecimals(r.interest),
    }));
    console.log("Save licensee interest", payload);
    alert("Interest values saved (see console for payload).");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 flex flex-col min-h-[calc(100vh-2rem)]">
      <div className="mb-6 w-full">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="min-w-0 max-w-3xl text-2xl font-bold text-gray-900">
            Licensee shares
          </h1>
          <VotingRulesTabs className="shrink-0" />
        </div>
        <p className="max-w-3xl text-sm text-gray-600">
          JV company ownerships. Values use six decimal places; total must equal
          100% before save.
        </p>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Last updated 9 Apr 2026 by Martin Ole Rødested (Nietre AS)
      </p>

      <div className="flex-1 min-h-0">
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-gray-700">
                <th className="py-3 px-4 font-semibold w-1/2">Licensee</th>
                <th className="py-3 px-4 font-semibold text-right">
                  Interest (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50/80"
                >
                  <td className="py-3 px-4 align-middle">
                    <button
                      type="button"
                      className="text-blue-700 hover:text-blue-900 hover:underline text-left"
                    >
                      {row.name}
                    </button>
                  </td>
                  <td className="py-2 px-4 align-middle text-right">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={row.interest}
                      onChange={(e) => updateInterest(row.id, e.target.value)}
                      onBlur={() => handleBlur(row.id)}
                      className="w-full max-w-[11rem] ml-auto rounded border border-gray-300 px-3 py-1.5 text-gray-900 tabular-nums text-right focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      aria-label={`Interest for ${row.name}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr
                className="border-t-2 border-blue-500 bg-gradient-to-r from-blue-50 to-sky-50 text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]"
                aria-live="polite"
              >
                <td className="py-4 px-4 font-bold text-base align-middle">
                  Total
                </td>
                <td className="py-4 px-4 text-right align-middle">
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-baseline sm:justify-end sm:gap-3">
                    <span className="font-mono tabular-nums text-lg font-bold tracking-tight">
                      {total.toFixed(6)}%
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        totalsHundred ? "text-emerald-900" : "text-amber-900"
                      }`}
                    >
                      {totalsHundred
                        ? "— ready to save"
                        : "— must equal 100.000000%"}
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <footer className="flex flex-wrap justify-end gap-2 pt-8 mt-auto border-t border-gray-200">
        <Button size="sm" variant="outline" type="button">
          Cancel
        </Button>
        <Button
          size="sm"
          type="button"
          disabled={!totalsHundred}
          title={
            totalsHundred
              ? undefined
              : "Adjust shares so the total equals 100.000000%"
          }
          onClick={handleSave}
          className="inline-flex items-center bg-blue-500 text-white hover:bg-blue-600 disabled:pointer-events-none disabled:opacity-50"
        >
          Save shares
        </Button>
      </footer>
    </div>
  );
}
