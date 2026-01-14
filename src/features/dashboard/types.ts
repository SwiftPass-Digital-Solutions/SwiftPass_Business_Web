export type DocumentStatus =
  | "Approved"
  | "Pending"
  | "Rejected"
  | "NotSubmitted";

export type DocumentItem = {
  id: string;
  title: string;
  status: DocumentStatus;
};
