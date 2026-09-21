export const STATUS_STYLES = {
    PENDING: {
        badge: "bg-success-soft text-success-fg",
        rowIcon: "bg-success-soft text-success",
    },
    PAUSED: {
        badge: "bg-warning-soft text-warning-fg",
        rowIcon: "bg-warning-soft text-warning",
    },
    SENDING: {
        badge: "bg-info-soft text-info-fg",
        rowIcon: "bg-accent-soft text-accent",
    },
    SENT: {
        badge: "bg-surface text-ink-muted",
        rowIcon: "bg-surface text-ink-muted",
    },
    FAILED: {
        badge: "bg-danger-soft text-danger-fg",
        rowIcon: "bg-danger-soft text-danger",
    },
};

export const normalizeStatus = (status) => {
    const normalized = String(status || "PENDING").toUpperCase();
    if (normalized === "SCHEDULED" || normalized === "ACTIVE") return "PENDING";
    if (normalized === "PROCESSING") return "SENDING";
    return STATUS_STYLES[normalized] ? normalized : "PENDING";
};

export const normalizeFrequency = (frequency) => {
    const value = String(frequency || "ONCE").toUpperCase();
    return ["ONCE", "DAILY", "WEEKLY", "MONTHLY", "CUSTOM"].includes(value)
        ? value
        : "ONCE";
};
