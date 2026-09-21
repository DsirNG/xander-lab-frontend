/** Common IANA timezone presets shared by every scheduling feature
 * (email reminders, scheduled posts). Values are valid ZoneId ids. */
export const TIMEZONE_OPTIONS = [
    {
        value: "Asia/Shanghai",
        label: "(GMT+08:00) 北京, 上海, 香港",
        offset: "+08:00",
    },
    { value: "Asia/Tokyo", label: "(GMT+09:00) 东京", offset: "+09:00" },
    { value: "Asia/Singapore", label: "(GMT+08:00) 新加坡", offset: "+08:00" },
    { value: "Asia/Seoul", label: "(GMT+09:00) 首尔", offset: "+09:00" },
    { value: "UTC", label: "(GMT+00:00) UTC", offset: "+00:00" },
    { value: "Europe/London", label: "(GMT+00:00) 伦敦", offset: "+00:00" },
    { value: "Europe/Paris", label: "(GMT+01:00) 巴黎", offset: "+01:00" },
    { value: "America/New_York", label: "(GMT-05:00) 纽约", offset: "-05:00" },
    {
        value: "America/Los_Angeles",
        label: "(GMT-08:00) 洛杉矶",
        offset: "-08:00",
    },
    { value: "Australia/Sydney", label: "(GMT+10:00) 悉尼", offset: "+10:00" },
];

/** Current UTC offset (e.g. GMT+08:00) for an IANA zone, computed at render
 * time so DST zones stay accurate; falls back to GMT on invalid zones. */
export const getZoneOffsetLabel = (timeZone, date = new Date()) => {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone,
            timeZoneName: "shortOffset",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).formatToParts(date);
        return (
            parts.find((part) => part.type === "timeZoneName")?.value || "GMT"
        );
    } catch {
        return "GMT";
    }
};
