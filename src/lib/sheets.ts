/** the document's sheet index — section ids double as deep links */
export const SHEETS = [
  { id: "sec-00", num: "00", title: "SIGNAL" },
  { id: "sec-01", num: "01", title: "OPERATOR" },
  { id: "sec-02", num: "02", title: "FIELD RECORDS" },
  { id: "sec-03", num: "03", title: "CASE FILES" },
  { id: "sec-04", num: "04", title: "ON THE BENCH" },
  { id: "sec-05", num: "05", title: "THE GRAPH" },
  { id: "sec-06", num: "06", title: "TITLE BLOCK" },
] as const;

export type SheetId = (typeof SHEETS)[number]["id"];
