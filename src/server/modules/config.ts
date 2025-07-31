/**
 * This file exposes a function to load configuration
 * options from the command line and ENV. It will automatically
 * provided default values if needed.
 *
 * The help message is also included in this file because
 * it's only really used to log the CLI arguments anyways.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import { argv } from 'bun';
import { env } from 'process';

/**
 * Configuration object.
 */
export interface Configuration {
    /** Port for the server to run on. */
    port: number;
    /** Wether the port should be reusable or not. */
    reusePort: boolean;
    /** If true, the server should log a help message then exit. */
    helpMessage: boolean;
    /** The amount of task threads to spawn. */
    taskThreads: number;
}

/** Log a help message using 'console.log'. */
export function logHelpMessage() {
    console.log(`
~! api.jtoh.pro Help Message

Thank you for using our project! The file 'x' contains all the commands to help you get started.
Simply type './x' to get a list of available commands.

Note that the actual codebase has a couple command line arguments which can be passed to change its behavior.
To pass command arguments, run './x start --<argumentName> <argumentValue>'.
For example: './x start --port 5000 --reusePort true'

Available CLI Arguments:
--port <number> -- Port for the server to run on. (Default: 5555)
--reusePort <boolean> -- If true, other processes can run on the same port. This can be used for load balancing. (Default: false)
--helpMessage <boolean> -- If true, a help message will be printed and the process will exit. (Default: false)
--taskThreads <number> -- The amount of task/worker threads to spawn. Watch out for memory usage! (Default: 2)

* NOTE: For boolean arguments, passing anything will be considered true! Do not pass anything for false.

There is also environment variables, please copy and rename '.example.env' to '.env' to get started with them.
`);
}

/**
 * Load configuration options from the command line. (Bun.argv)
 * @returns The loaded configuration.
 */
export function loadConfigurationFromArgv(): Configuration {
    // Note that this is a simple approach and does not support
    // "string something" arguments. You could probably do this
    // with Regex or something, however this was the easiest approach
    // from my current understanding!

    const providedArgs = argv.splice(2);
    const parsed: Array<{ name: string; value: string }> = [];

    let previousName: string | undefined;
    for (const arg of providedArgs) {
        if (arg.startsWith('--')) {
            previousName = arg.split('--')[1].toLowerCase(); // Case insensitive commands are nice.
            continue;
        }

        if (previousName) {
            parsed.push({ name: previousName, value: arg });
            previousName = undefined;
        }
    }

    /** Simple function to get the value from the parsed array. */
    const getValue = (name: string) =>
        parsed[parsed.findIndex((value) => value.name === name.toLowerCase())]?.value as string | undefined;

    let port: number = parseInt(getValue('port') ?? '');
    if (isNaN(port)) port = 5555;

    const reusePort = Boolean(getValue('reusePort'));
    const helpMessage = Boolean(getValue('helpMessage'));

    let taskThreads = parseInt(getValue('taskThreads') ?? '');
    if (isNaN(taskThreads)) taskThreads = 2;

    return { port, reusePort, helpMessage, taskThreads };
}

/** Environment configuration. This will be configuration options that are more sensitive. */
export interface EnvConfiguration {
    proxy?: string;
}

/**
 * Load environment configuration.
 * @returns The environment configuration.
 */
export function loadConfigurationFromEnv() {
    return {
        proxy: env.proxy ?? undefined
    };
}
