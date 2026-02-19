import { ValidationDomainError } from '@/libs/errors/domain.error';

const COUNTRY_CODE_END = 2;
const CHECK_DIGITS_END = 4;
const LETTER_TO_NUMBER_OFFSET = 55;
const MOD_97_DIVISOR = 97n;
const FORMAT = /^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/;

/**
 * ISO 13616 — International Bank Account Number
 *
 * Format: 2 letters (country) + 2 digits (check) + 4-30 alphanum (BBAN)
 * Example: FR7630006000011234567890189
 *
 * Used in ISO 20022 within:
 * ```XML
 * <DbtrAcct>
 *   <Id>
 *     <IBAN> Debtor's IBAN </IBAN>
 *   </Id>
 * </DbtrAcct>
 * <CdtrAcct>
 *   <Id>
 *     <IBAN> Creditor's IBAN </IBAN>
 *   </Id>
 * </CdtrAcct>
 * ```
 */
export class Iban {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): Iban {
		const cleaned = Iban._clean(value);
		Iban._validate(cleaned);
		return new Iban(cleaned);
	}

	// ─── Getters ────────────────────────────────────────────────

	get countryCode(): string {
		return this._value.substring(0, COUNTRY_CODE_END);
	}

	// ─── Behavior ───────────────────────────────────────────────

	equals(other: Iban): boolean {
		return this._value === other._value;
	}

	// ─── Serialization ──────────────────────────────────────────

	toString(): string {
		return this._value;
	}

	// ─── Private methods ────────────────────────────────────────

	private static _clean(value: string): string {
		return value.replace(/\s/g, '').toUpperCase();
	}

	private static _validate(value: string): void {
		if (value.length === 0) {
			throw new ValidationDomainError('IBAN cannot be empty.', { value });
		}

		if (!FORMAT.test(value)) {
			throw new ValidationDomainError('Invalid IBAN format (ISO 13616).', {
				value,
			});
		}

		if (!Iban._isChecksumValid(value)) {
			throw new ValidationDomainError('Invalid IBAN checksum.', { value });
		}
	}

	/**
	 * MOD-97 algorithm (ISO 7064)
	 * 1. Move the first 4 characters to the end
	 * 2. Convert letters to digits (A=10, B=11, ..., Z=35)
	 * 3. The remainder of division by 97 must be 1
	 */
	private static _isChecksumValid(iban: string): boolean {
		const rearranged = iban.substring(CHECK_DIGITS_END) + iban.substring(0, CHECK_DIGITS_END);

		const numeric = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - LETTER_TO_NUMBER_OFFSET).toString());

		return BigInt(numeric) % MOD_97_DIVISOR === 1n;
	}
}
