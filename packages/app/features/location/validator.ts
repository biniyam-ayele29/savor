export const MAX_FLOORS = 10;
export const SUITE_REGEX = /^[A-Z0-9-]+$/;

export function isValidFloor(floor: number): boolean {
    return floor >= 1 && floor <= MAX_FLOORS;
}

export function isValidSuite(suite: string): boolean {
    return SUITE_REGEX.test(suite) && suite.length > 0;
}

export function formatLocation(floor: number, suite: string): string {
    return `Floor ${floor}, Suite ${suite}`;
}
