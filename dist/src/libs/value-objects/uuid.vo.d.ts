export declare class Uuid {
	private static readonly _VERSION;
	private readonly _value;
	private constructor();
	static create(value: string): Uuid;
	static generate(): Uuid;
	equals(other: Uuid): boolean;
	toString(): string;
	private _validate;
}
