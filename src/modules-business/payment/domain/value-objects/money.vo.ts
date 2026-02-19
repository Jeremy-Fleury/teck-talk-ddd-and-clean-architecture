import { ValidationDomainError } from '@/libs/errors/domain.error';

const MAX_ISO20022_DIGITS = 18;
const CURRENCY_FORMAT = /^[A-Z]{3}$/;
const DECIMAL_PRECISION = 2;

/**
 * Money — Amount + Currency
 *
 * ISO 20022 uses ISO 4217 for currency codes (3 letters).
 * The ISO 20022 amount allows up to 18 digits (integer + decimal).
 *
 * Used in ISO 20022 within:
 * ```XML
 * <IntrBkSttlmAmt Ccy="EUR">12500.00</IntrBkSttlmAmt>
 * ```
 */
export class Money {
	private readonly _amount: number;
	private readonly _currency: string;

	private constructor(amount: number, currency: string) {
		this._amount = amount;
		this._currency = currency;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(amount: number, currency: string): Money {
		const cleanedCurrency = Money._clean(currency);
		Money._validate(amount, cleanedCurrency);
		return new Money(amount, cleanedCurrency);
	}

	// ─── Getters ────────────────────────────────────────────────

	get amount(): number {
		return this._amount;
	}

	get currency(): string {
		return this._currency;
	}

	// ─── Behaviors ──────────────────────────────────────────────

	add(other: Money): Money {
		this._assertSameCurrency(other);
		return new Money(this._amount + other._amount, this._currency);
	}

	subtract(other: Money): Money {
		this._assertSameCurrency(other);
		const result = this._amount - other._amount;

		if (result < 0) {
			throw new ValidationDomainError('Subtraction would result in negative amount.', {
				left: this._amount,
				right: other._amount,
			});
		}

		return new Money(result, this._currency);
	}

	// ─── Behavior ───────────────────────────────────────────────

	equals(other: Money): boolean {
		return this._amount === other._amount && this._currency === other._currency;
	}

	// ─── Serialization ──────────────────────────────────────────

	toString(): string {
		return `${this._currency} ${this._amount.toFixed(DECIMAL_PRECISION)}`;
	}

	// ─── Private methods ────────────────────────────────────────

	private static _clean(value: string): string {
		return value.toUpperCase().trim();
	}

	private static _validate(amount: number, currency: string): void {
		if (amount < 0) {
			throw new ValidationDomainError('Amount cannot be negative.', { amount });
		}

		const digitCount = amount.toString().replace('.', '').length;
		if (digitCount > MAX_ISO20022_DIGITS) {
			throw new ValidationDomainError(`Amount exceeds ISO 20022 maximum of ${MAX_ISO20022_DIGITS} digits.`, {
				amount,
			});
		}

		if (!CURRENCY_FORMAT.test(currency)) {
			throw new ValidationDomainError('Invalid ISO 4217 currency code.', {
				currency,
			});
		}
	}

	private _assertSameCurrency(other: Money): void {
		if (this._currency !== other._currency) {
			throw new ValidationDomainError('Cannot operate on different currencies.', {
				left: this._currency,
				right: other._currency,
			});
		}
	}
}
