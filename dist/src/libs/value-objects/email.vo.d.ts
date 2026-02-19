export declare class Email {
	private readonly _value;
	private static readonly _MAX_LENGTH;
	private constructor();
	static create(value: string): Email;
	equals(other: Email): boolean;
	toString(): string;
	private _clean;
	private _validate;
}
