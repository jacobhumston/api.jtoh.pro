/**
 * Simple logging module that creates an instance of
 * winston to use for all logging purposes.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import { createLogger, format, transports } from 'winston';

/** Default winston logger. */
export default createLogger({
    level: 'info',
    format: format.simple(),
    transports: [new transports.Console({ format: format.combine(format.colorize(), format.simple()) })]
});
