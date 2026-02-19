import { ValidationDomainError } from '@/libs/errors/domain.error';

const INSTITUTION_CODE_END = 4;
const COUNTRY_CODE_START = 4;
const COUNTRY_CODE_END = 6;

/**
 * ISO 9362 — Business Identifier Code (BIC / SWIFT Code)
 *
 * Format: AAAA BB CC (DDD)
 *   - AAAA : institution code (4 letters)
 *   - BB   : ISO 3166-1 country code (2 letters)
 *   - CC   : location code (2 alphanum)
 *   - DDD  : optional branch code (3 alphanum, "XXX" = head office)
 *
 * Example: BNPAFRPP (BNP Paribas, France, Paris)
 *
 * Used in ISO 20022 within: <DbtrAgt><FinInstnId><BICFI>, <CdtrAgt><FinInstnId><BICFI>
 */
export class Bic {
	private static readonly _format = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): Bic {
		const cleaned = Bic._clean(value);
		Bic._validate(cleaned);
		return new Bic(cleaned);
	}

	// ─── Getters ────────────────────────────────────────────────

	/** ISO 3166-1 country code (positions 5-6) */
	get countryCode(): string {
		return this._value.substring(COUNTRY_CODE_START, COUNTRY_CODE_END);
	}

	/** Institution code (positions 1-4) */
	get institutionCode(): string {
		return this._value.substring(0, INSTITUTION_CODE_END);
	}

	// ─── Behavior ───────────────────────────────────────────────

	equals(other: Bic): boolean {
		return this._value === other._value;
	}

	// ─── Serialization ──────────────────────────────────────────

	toString(): string {
		return this._value;
	}

	// ─── Private methods ────────────────────────────────────────

	private static _clean(value: string): string {
		return value.toUpperCase().trim();
	}

	private static _validate(value: string): void {
		if (value.length === 0) {
			throw new ValidationDomainError('BIC cannot be empty.', { value });
		}

		if (!Bic._format.test(value)) {
			throw new ValidationDomainError('Invalid BIC format (ISO 9362).', {
				value,
			});
		}
	}
}
