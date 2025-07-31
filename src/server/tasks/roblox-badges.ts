/**
 * This file handles the 'RobloxBadgesRequest' worker event.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import type { WorkerEventOfType, WorkerEvents } from '../modules/types';
import { RobloxEndpoints } from '../modules/requests';
import type { EnvConfiguration } from '../modules/config';

/**
 * Handle Roblox badges requests.
 * @param request The request.
 * @param env The environment configuration.
 * @param retry Retry function.
 * @param postMessage Post message function.
 */
export async function handleRobloxBadgesRequests(
    request: WorkerEventOfType<'RobloxBadgesRequest'>,
    env: EnvConfiguration,
    retry: () => void,
    postMessage: (data: WorkerEvents) => void
) {
    const response = await fetch(RobloxEndpoints.Badges.AwardedDates(request.userId, request.badges), {
        method: 'GET',
        proxy: env.proxy
    }).catch(() => ({ ok: false }));
    if (!response.ok || !(response instanceof Response)) return retry();

    const responseJSON = (await response.json().catch(() => undefined)) as
        | { data: Array<{ badgeId: number; awardedDate: string | undefined }> }
        | undefined;
    if (!responseJSON) return retry();

    return postMessage({
        type: 'RobloxBadgesResponse',
        badges: responseJSON.data.map((badge) => ({
            id: badge.badgeId,
            owned: !!badge.awardedDate,
            awarded: badge.awardedDate ? new Date(badge.awardedDate) : null,
            cached: false
        })),
        id: request.id,
        retries: request.retries,
        userId: request.userId
    });
}
