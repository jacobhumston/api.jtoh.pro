/**
 * This file handles the 'RobloxBadgesRequest' worker event.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import type { WorkerEventOfType, WorkerEvents } from '../modules/types';
import { RobloxEndpoints } from '../modules/requests';
import type { EnvConfiguration } from '../modules/config';
import { threadId } from 'node:worker_threads';

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
    postMessage: (data: WorkerEvents) => void,
    log: (message: string) => void
) {
    log(
        `Worker ${threadId} received Roblox badges request for user ${request.userId} with badges: ${request.badges.length}`
    );

    const reqTime = performance.now();
    const response = await fetch(RobloxEndpoints.Badges.AwardedDates(request.userId, request.badges), {
        method: 'GET',
        proxy: env.proxy
    }).catch(() => ({ ok: false }));
    if (!response.ok || !(response instanceof Response)) return retry();

    log(
        `Roblox badges request took ${((performance.now() - reqTime) / 1000).toPrecision(2)}s for user ${request.userId} with badges: ${request.badges.length}.`
    );

    const responseJSON = (await response.json().catch(() => undefined)) as
        | { data: Array<{ badgeId: string; awardedDate: string | undefined }> }
        | undefined;
    if (!responseJSON) return retry();

    const badgesResult: WorkerEventOfType<'RobloxBadgesResponse'>['badges'] = responseJSON.data.map((badge) => ({
        id: `${badge.badgeId}`,
        owned: true,
        awarded: new Date(badge.awardedDate as string),
        cached: false
    }));

    badgesResult.push(
        ...request.badges
            .filter((id) => badgesResult.find((badge) => `${badge.id}` === `${id}`) === undefined)
            .map((id) => ({ id: `${id}`, owned: false, awarded: null, cached: false }))
    );

    return postMessage({
        type: 'RobloxBadgesResponse',
        badges: badgesResult,
        id: request.id,
        retries: request.retries,
        userId: request.userId
    });
}
