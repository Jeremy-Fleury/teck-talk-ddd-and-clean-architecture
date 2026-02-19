import { isEmail } from 'validator';

import { ValidationDomainError } from '@/libs/errors/domain.error';

export class Email {
	private readonly _value: string;
	private static readonly _maxLength = 254;

	private constructor(value: string) {
		const cleaned = this._clean(value);
		this._validate(cleaned);
		this._value = cleaned;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): Email {
		return new Email(value);
	}

	// ─── Behavior ─────────────────────────────────────────────

	equals(other: Email): boolean {
		return this._value === other._value;
	}

	// ─── Serialization ────────────────────────────────────────

	toString(): string {
		return this._value;
	}

	// ─── Private methods ────────────────────────────────────────

	private _clean(value: string): string {
		return value.trim().toLowerCase();
	}

	private _validate(value: string): void {
		if (value.length === 0) {
			throw new ValidationDomainError('Email cannot be empty.', { value });
		}

		if (value.length > Email._maxLength) {
			throw new ValidationDomainError(`Email exceeds maximum length of ${Email._maxLength} characters.`, {
				value,
			});
		}

		if (!isEmail(value)) {
			throw new ValidationDomainError('Email format is invalid.', { value });
		}
	}
}
