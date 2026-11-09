/** Client-safe workspace shapes. */
export interface WorkspaceMemberSummary {
  userId: string;
  displayName: string;
  initial: string;
}

export interface WorkspaceSummary {
  id: number;
  name: string;
  /** ISO country and currency. Budgets and money in the space use the currency. */
  country: string;
  currency: string;
  members: WorkspaceMemberSummary[];
  isFull: boolean;
}
