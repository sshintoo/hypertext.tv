import { getEntry } from "astro:content";
import { findActiveProgram } from "@utils/findActiveProgram";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params }) => {
  const id = params.id;
  const datetime = params.datetime ? new Date(params.datetime) : new Date();

  if (!id) {
    return new Response(null, {
      status: 400,
      statusText: "No channel ID provided",
    });
  }

  const channel = await getEntry("channels", id);

  if (!channel) {
    return new Response(null, {
      status: 404,
      statusText: "Channel not found",
    });
  }

  const program = findActiveProgram(channel.data.schedule, datetime);

  if (!program) {
    return new Response(JSON.stringify({}), {
      status: 200,
      statusText: "No program found",
    });
  }

  return new Response(JSON.stringify(program), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
