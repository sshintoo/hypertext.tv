import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export async function listAllContributors() {
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

export const GET: APIRoute = async () => {
  const contributors = await listAllContributors();

  if (!contributors) {
    return new Response(null, {
      status: 404,
      statusText: "No contributors found",
    });
  }
  
  return new Response(JSON.stringify(contributors), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}