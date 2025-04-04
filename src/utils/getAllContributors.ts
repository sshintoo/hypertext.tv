import { getCollection } from "astro:content";

export async function getAllContributors() {
  const allChannels = await getCollection("channels");
  const allContributors = allChannels.flatMap((channel) =>
    Object.values(channel.data.schedule).flatMap(
      (day) =>
        day?.flatMap((slot) => {
          const timeSlot = Object.values(slot)[0];
          if (!timeSlot?.author) return [];
          return Array.isArray(timeSlot.author)
            ? timeSlot.author
            : [timeSlot.author];
        }) ?? [],
    ),
  );

  // Remove duplicates and sort
  return [...new Set(allContributors)].sort();
}
