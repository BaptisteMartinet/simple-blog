
function timeSince(date) {
  const seconds = Math.floor((new Date().getTime() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " year(s)";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " month(s)";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " day(s)";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hour(s)";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minute(s)";
  return Math.floor(seconds) + " second(s)";
}
