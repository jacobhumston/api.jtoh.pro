/**
 * This file is executed for each worker
 * thread that is created. Used to listen to
 * and executed tasks as needed.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

declare var self: Worker;

import type { WorkerEvent, WorkerEvents } from './modules/types';
import { loadConfigurationFromEnv } from './modules/config';
import { isMainThread } from 'bun';
import { threadId } from 'node:worker_threads';
import { handleRobloxBadgesRequests } from './tasks/roblox-badges';

if (isMainThread) throw 'Worker running in main thread.';

const env = loadConfigurationFromEnv();

/**
 * Post a message to the main process.
 * @param data Data to send.
 */
function postMessage(data: WorkerEvents) {
    return self.postMessage(data);
}

/**
 * Log a message to the main thread.
 * @param message The message to log.
 */
function log(message: string) {
    return postMessage({
        type: 'Log',
        message: message,
        id: '@', // ID is completely ignored for log events.
        retries: 0
    });
}

// Listen for requests.
self.addEventListener('message', async (event: WorkerEvent) => {
    const request = event.data;

    // We should return an error if the request took more then 3 attempts.
    if (request.retries > 3)
        return postMessage({
            type: 'RequestFailed',
            error: 'Retries for this request exceeded 3.',
            id: request.id,
            retries: request.retries
        });

    /** Attempt to retry the request after a 1 second cool down. */
    function retry() {
        request.retries++;
        setTimeout(() => {
            self.dispatchEvent(new Event('message', event));
        }, 1000);
    }

    // TODO: Implement caching.
    if (request.type === 'RobloxBadgesRequest') {
        return handleRobloxBadgesRequests(request, env, retry, postMessage);
    } else if (request.type === 'RobloxBadgesRefreshRequest') {
        // TODO: Implement badge refreshes.
    }
});

// Log that the worker was created.
log(`Worker created! (${threadId})`);
