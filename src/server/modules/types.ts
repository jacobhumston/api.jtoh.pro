/**
 * This fle exports types that are used
 * in workers and main processes. This is to prevent
 * actual logic from being executed.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

import type { BunMessageEvent } from 'bun';

/** Base event properties that all worker events should have. */
type BaseWorkerEvent = {
    id: string;
    retries: number;
};

/** Available event types that a worker may encounter. */
type WorkerEventTypes =
    | { type: 'RobloxBadgesRequest'; badges: Array<number>; userId: number }
    | {
          type: 'RobloxBadgesResponse';
          badges: Array<{ id: number; owned: boolean; awarded: Date | null; cached: boolean }>;
          userId: number;
      }
    | { type: 'RobloxBadgesRefreshRequest'; badges: Array<number>; userId: number }
    | { type: 'RobloxBadgesRefreshResponse'; badges: Array<{ id: number; refreshed: boolean }>; userId: number }
    | { type: 'RequestFailed'; error: string }
    | { type: 'Log'; message: string };

/** Worker events. */
export type WorkerEvents = WorkerEventTypes & BaseWorkerEvent;

/** A worker event. */
export type WorkerEvent = BunMessageEvent<WorkerEvents>;

/** Generic type to get a specific event type by its type property */
export type WorkerEventOfType<T extends WorkerEvents['type']> = Extract<WorkerEvents, { type: T }>;

/** Generic worker event for a specific event type */
export type WorkerEventMessage<T extends WorkerEvents['type']> = BunMessageEvent<WorkerEventOfType<T>>;

/** Worker event types. */
export type WorkerEventPossibleTypes = WorkerEvents['type'];
