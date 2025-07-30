/**
 * This file exports a task manager class which allows
 * other scripts to easily create and manage tasks.
 * This is primarily used in task/worker threads to
 * manage API request processing.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

/**
 * A task.
 */
export interface Task<T> {
    /** The function to execute. */
    function: () => Promise<T> | T;
    /** Max retries. */
    retries: number;
    /** Retry cool down. (In milliseconds.) */
    retriesDebounce: number;
}

/**
 * Task manager used for creating, queuing, and
 * executing tasks. '<DataType>' should be the data type
 * of what kind of data tasks return.
 */
export class TaskManager<DataType> {
    /** An array of current tasks. */
    queue: Array<Task<DataType>> = [];

    /** The max amount of tasks that can be executing at once. */
    maxConcurrency: number = 10;

    constructor(options: Partial<TaskManager<DataType>>) {
        Object.assign(this, options);
    }
}
