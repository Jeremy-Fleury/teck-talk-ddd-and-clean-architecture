export declare class Auth0Id {
	private static readonly _PATTERN;
	private readonly _provider;
	private readonly _identifier;
	private constructor();
	static create(value: string): Auth0Id;
	get provider(): string;
	get identifier(): string;
	equals(other: Auth0Id): boolean;
	toString(): string;
	private _parse;
	private _clean;
	private _validate;
}
