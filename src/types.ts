export type Program = {
  title: string;
  url?: string;
};

export type ActiveProgram = {
  program: Program | null;
  startTime?: string;
  endTime?: string;
};

export type TimeSlot = {
  [time: string]: Program | null;
};
