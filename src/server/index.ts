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
import { serve } from 'bun';
import { loadConfigurationFromArgv, logHelpMessage } from './modules/config';
import logger from './modules/logger';
import process from 'node:process';

// Create a Hono application as well as load configuration.
const application = new Hono();
const config = loadConfigurationFromArgv();

// TODO: Move this somewhere else.
if (!process.env.proxy || process.env.proxy.length < 1) logger.warn('[.env].proxy was not provided!');

// If the help message is requested, then log it and exit.
if (config.helpMessage === true) {
    logHelpMessage();
    process.exit();
}

// Serve the API using 'Bun.serve()'.
serve({
    port: config.port,
    reusePort: config.reusePort,
    fetch: application.fetch
});

// Very useful for debugging.
logger.info(`Server started with config:\n${JSON.stringify(config, null, 4)}`);
