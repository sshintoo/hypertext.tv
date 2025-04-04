import type { ActiveProgram, Program, TimeSlot } from "src/types";

export function findActiveProgram(
  schedule: { [day: string]: TimeSlot[] | null } | null,
  currentTime: Date,
): ActiveProgram | null {
  if (!schedule) return null;

  // Get current day's schedule
  const dayOfWeek = currentTime
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as keyof typeof schedule;

  const timeSlots = schedule[dayOfWeek];
  if (!timeSlots?.length) return null;

  // Convert current time to HH:MM format for comparison
  const currentTimeStr = currentTime
    .toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/^24:/, "00:");

  // Sort time slots chronologically
  const sortedSlots = timeSlots.sort((a, b) => {
    const timeA = Object.keys(a)[0];
    const timeB = Object.keys(b)[0];
    return timeA.localeCompare(timeB);
  });

  // Find the current time slot
  let currentSlot: { program: Program | null; startTime: string } | null = null;

  // Find which time slot we're currently in
  for (let i = 0; i < sortedSlots.length; i++) {
    const slotTime = Object.keys(sortedSlots[i])[0];
    const program = sortedSlots[i][slotTime];

    // If this slot has a defined program (even if null), it's our current slot
    if (program !== undefined) {
      if (slotTime > currentTimeStr) {
        break; // Only break after we've found the next defined program
      }
      currentSlot = {
        program,
        startTime: slotTime,
      };
    }
  }

  // If we found a current slot, determine when it ends
  if (currentSlot) {
    // Find the next defined slot to determine end time
    const currentIndex = sortedSlots.findIndex(
      (slot) => Object.keys(slot)[0] === currentSlot.startTime,
    );

    // Look for the next defined slot
    let endTime = "24:00";
    for (let i = currentIndex + 1; i < sortedSlots.length; i++) {
      const nextSlot = sortedSlots[i];
      const nextTime = Object.keys(nextSlot)[0];
      const nextProgram = nextSlot[nextTime];

      if (nextProgram !== undefined) {
        endTime = nextTime;
        break;
      }
    }

    // Only return the program if we haven't passed its end time
    if (currentTimeStr < endTime) {
      return {
        program: currentSlot.program,
        startTime: currentSlot.startTime,
        endTime,
      };
    }
  }

  return null;
}
