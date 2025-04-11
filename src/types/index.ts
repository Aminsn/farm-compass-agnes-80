
export interface Event {
  id: string;
  date: Date | string;
  title: string;
  description?: string;
  type: string;
  status?: string;
}
