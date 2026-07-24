import { del, get, patch, post } from '@api/http';

const BASE = '/api/email-reminders';

export const emailReminderService = {
    list: (config) => get(BASE, undefined, config),

    create: (data, config) => post(BASE, data, config),

    updateStatus: (id, status, config) => (
        patch(`${BASE}/${id}/status`, { status }, config)
    ),

    remove: (id, config) => del(`${BASE}/${id}`, undefined, config),
};
