import { del, get, patch, post } from '@api/http';

const BASE = '/api/email-reminders';

export const emailReminderService = {
    /**
     * GET /api/email-reminders?page=&size=&status=&search=
     * @returns {Promise<{ records, total, current, pages, size, hasMore, stats }>}
     */
    list: ({ page = 1, size = 10, status, search } = {}, config) => {
        const params = Object.fromEntries(
            Object.entries({ page, size, status, search }).filter(
                ([, value]) => value !== '' && value !== undefined && value !== null
            )
        );
        return get(BASE, params, config);
    },

    create: (data, config) => post(BASE, data, config),

    updateStatus: (id, status, config) => (
        patch(`${BASE}/${id}/status`, { status }, config)
    ),

    remove: (id, config) => del(`${BASE}/${id}`, undefined, config),
};
