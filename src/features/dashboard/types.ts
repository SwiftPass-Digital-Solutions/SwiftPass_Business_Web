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

export interface Customers {
  customerId: number;
  customerName: string;
  spsn: string;
  onboardedOn: string;
  lastLookedUp: string;
}
