export interface Equipment {
  value: string;
  label: string;
  workingLoad: number;
  loadLimit: number;
  quantity: number;
  inletThrust: number;
  outletThrust: number;
  category: string;
}

export type StatusType = '' | 'warning' | 'error' | undefined;