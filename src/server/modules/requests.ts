/**
 * This script contains a couple request utilities.
 *
 * Authored by Jacob Humston
 * (c) GNU GENERAL PUBLIC LICENSE
 */

/** Roblox API endpoints. */
export const RobloxEndpoints = {
    /** Badges endpoints. */
    Badges: {
        /** Base for Roblox badges endpoints. */
        Base: 'https://badges.roblox.com/v1',
        /** Get the awarded dates for up to 100 badges for a user. */
        AwardedDates(UserId: number, badges: Array<string>): string {
            return `${this.Base}/users/${UserId}/badges/awarded-dates?badgeIds=${badges.join(',')}`;
        }
    }
};
