import { ValidationDomainError } from '@/libs/errors/domain.error';

const MAX_LENGTH = 35;
const NOT_PROVIDED = 'NOTPROVIDED';

/**
 * EndToEndId — End-to-end identifier for a credit transfer
 *
 * ISO 20022:
 * ```XML
 * <PmtId>
 *   <EndToEndId>
 *     <EndToEndId> End-to-end identifier </EndToEndId>
 *   </EndToEndId>
 * </PmtId>
 * ```
 * "Unique identification assigned by the initiating party to unambiguously
 *  identify the transaction. This identification is passed on, unchanged,
 *  throughout the entire end-to-end chain."
 *
 * This is the identifier that traverses the entire flow pain.001 → pacs.008 → pacs.002
 * without ever being modified. It is the golden thread of the payment.
 *
 * ISO 20022 constraints:
 *   - Mandatory
 *   - Max 35 characters
 *   - If not provided by the client: "NOTPROVIDED"
 */
export class EndToEndId {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(value: string): EndToEndId {
		const cleaned = EndToEndId._clean(value);
		EndToEndId._validate(cleaned);
		return new EndToEndId(cleaned);
	}

	static notProvided(): EndToEndId {
		return new EndToEndId(NOT_PROVIDED);
	}

	// ─── Getters ────────────────────────────────────────────────

	get isProvided(): boolean {
		return this._value !== NOT_PROVIDED;
	}

	// ─── Behavior ───────────────────────────────────────────────

	equals(other: EndToEndId): boolean {
		return this._value === other._value;
	}

	// ─── Serialization ──────────────────────────────────────────

	toString(): string {
		return this._value;
	}

	// ─── Private methods ────────────────────────────────────────

	private static _validate(value: string): void {
		if (value.length === 0) {
			throw new ValidationDomainError('EndToEndId cannot be empty.', { value });
		}

		if (value.length > MAX_LENGTH) {
			throw new ValidationDomainError(`EndToEndId cannot exceed ${MAX_LENGTH} characters (ISO 20022).`, {
				value,
			});
		}
	}

	private static _clean(value: string): string {
		return value.trim();
	}
}
