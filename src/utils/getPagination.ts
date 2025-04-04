import { getCollection } from "astro:content";
import { twoDigits } from "./twoDigits";

export const getPagination = async (channelId: string) => {
  const allChannels = await getCollection("channels");
  const sortedChannels = allChannels.sort((a, b) => a.id.localeCompare(b.id));
  const isValidId =
    channelId === "00" ||
    sortedChannels.some((channel) => channel.id === channelId);

  const firstChannelId = "00";
  const lastChannelId = sortedChannels[sortedChannels.length - 1].id;

  const isFirst = channelId === firstChannelId;
  const isLast = channelId === lastChannelId;

  const channelPrefix = "/ch/";

  if (!channelId || !isValidId)
    return {
      next: "/",
      prev: `${channelPrefix}${lastChannelId}`,
    };

  const next = isLast
    ? "/"
    : `${channelPrefix}${twoDigits(Number(channelId) + 1)}`;
  const prev = isFirst
    ? `${channelPrefix}${lastChannelId}`
    : `${channelPrefix}${twoDigits(Number(channelId) - 1)}`;

  return { next, prev };
};
