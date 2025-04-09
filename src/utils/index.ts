export const formatTimeFromSeconds = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs ? hrs + "h " : ""}${mins ? mins + "m " : ""}${
    secs ? secs + "s" : ""
  }`.trim();
};
