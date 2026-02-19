import { v7, validate, version } from 'uuid';

import { ValidationDomainError } from '@/libs/errors/domain.error';

export class Uuid {
	private static readonly _version = 7;
	private readonly _value: string;

	private constructor(value: string) {
		this._validate(value);
		this._value = value;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): Uuid {
		return new Uuid(value);
	}

	static generate(): Uuid {
		const uuid = v7();
		return new Uuid(uuid);
	}

	// ─── Behavior ─────────────────────────────────────────────

	equals(other: Uuid): boolean {
		return this._value === other._value;
	}

	// ─── Serialization ────────────────────────────────────────

	toString(): string {
		return this._value;
	}

	// ─── Private methods ────────────────────────────────────────

	private _validate(value: string): boolean {
		if (!validate(value)) {
			throw new ValidationDomainError(`Invalid UUID ${Uuid._version} format`);
		}

		if (version(value) !== Uuid._version) {
			throw new ValidationDomainError(`Invalid UUID ${Uuid._version} format`);
		}

		return true;
	}
}
