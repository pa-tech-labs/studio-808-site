type FixtureResponse = { ok: boolean; status: number; json(): Promise<unknown> }
export declare const FIXTURE_NAMES: string[]
export declare function cueFixture(name: string): { tiers: Record<string, unknown>; founding: Record<string, unknown> } | null
export declare function fixtureFetch(name: string): (url: string, init?: unknown) => Promise<FixtureResponse>
export declare function devCueFetch(): ((url: string, init?: unknown) => Promise<FixtureResponse>) | null
