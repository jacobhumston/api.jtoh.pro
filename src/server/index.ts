/**
 * This file creates the API server for the application.
 *
 * The goal is to separate handling requests and actually processing
 * them as much as possible. This way the framework can easily be
 * swapped with something else that is easier to use or faster.
 *
 * However this project is heavily dependent on bun, so switching
 * runtimes would require a lot more effort.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import { Hono } from 'hono';
import { randomUUIDv7, serve } from 'bun';
import { loadConfigurationFromArgv, logHelpMessage } from './modules/config';
import logger from './modules/logger';
import process from 'node:process';
import type { WorkerEvent, WorkerEventOfType } from './modules/types';

// Create a Hono application as well as load configuration.
const application = new Hono();
const apiApplication = new Hono();
const config = loadConfigurationFromArgv();

// Create workers.
const workers: Array<Worker> = [];
for (let i = 0; i < config.taskThreads; i++) {
    const worker = new Worker(new URL('./worker.ts', import.meta.url).href);

    // We will go ahead an attach the logger event here so we don't have to do it later.
    worker.addEventListener('message', (event: WorkerEvent) => {
        const request = event.data;
        if (request.type === 'Log') {
            logger.log('info', request.message);
        }
    });

    workers.push(worker);
}

// If the help message is requested, then log it and exit.
if (config.helpMessage === true) {
    logHelpMessage();
    process.exit();
}

// TODO: Organize this, currently testing.
apiApplication.post('/badges/:userId', async (context) => {
    const time = performance.now();

    const providedUserId = context.req.param('userId');
    const providedBadgeIds = await context.req.text();

    const userId = parseInt(providedUserId);
    const badgeIds = providedBadgeIds.split(',').map(parseInt);

    //if (badgeIds.length > 5000) return context.json({ error: 'Too many badges, max is 400.' }, 400);

    const badgeIdSets: Array<{ requestId: string; ids: Array<number> }> = [];
    while (badgeIds.length) {
        badgeIdSets.push({ requestId: randomUUIDv7(), ids: badgeIds.splice(0, 100) });
    }

    const parsedBadges: WorkerEventOfType<'RobloxBadgesResponse'>['badges'] = [];
    let workerIndex = -1;
    let requestsDone = 0;
    let requestsTotal = 0;

    for (const badgeSet of badgeIdSets) {
        workerIndex++;
        let worker = workers[workerIndex];
        if (!worker) {
            workerIndex = 0;
            worker = workers[0];
        }

        requestsTotal++;

        const request: WorkerEventOfType<'RobloxBadgesRequest'> = {
            type: 'RobloxBadgesRequest',
            userId: userId,
            badges: badgeSet.ids,
            id: badgeSet.requestId,
            retries: 0
        };
        worker.postMessage(request);
        worker.addEventListener('message', (event: WorkerEvent) => {
            if (event.data.id === request.id && event.data.type === 'RobloxBadgesResponse') {
                const response = event.data;
                parsedBadges.push(...response.badges);
                requestsDone++;
            } else if (event.data.id === request.id && event.data.type === 'RequestFailed') {
                logger.error(event.data);
                requestsDone++;
            }
        });
    }

    while (requestsTotal !== requestsDone) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return context.json({ time: performance.now() - time, badgeCount: parsedBadges.length, userId: userId, badges: parsedBadges });
});

// Route API endpoints.
application.route('/api', apiApplication);

// Serve the API using 'Bun.serve()'.
serve({
    port: config.port,
    reusePort: config.reusePort,
    fetch: application.fetch,
    idleTimeout: 255
});

// Very useful for debugging.
logger.info(`Server started with config:\n${JSON.stringify(config, null, 4)}`);
