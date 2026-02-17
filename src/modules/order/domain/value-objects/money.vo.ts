import type { Currency } from "./currency.vo";

export class Money {
	private constructor(
		public readonly amount: number,
		public readonly currency: Currency,
	) {}

	static create(amount: number, currency: Currency): Money {
		if (amount < 0) {
			throw new Error("Money amount cannot be negative");
		}
		return new Money(Math.round(amount * 100) / 100, currency);
	}

	add(other: Money): Money {
		if (!this.currency.equals(other.currency)) {
			throw new Error(`Cannot add ${this.currency} and ${other.currency}`);
		}
		return Money.create(this.amount + other.amount, this.currency);
	}

	multiply(quantity: number): Money {
		return Money.create(this.amount * quantity, this.currency);
	}

	equals(other: Money): boolean {
		return this.amount === other.amount && this.currency.equals(other.currency);
	}

	toString(): string {
		return `${this.amount.toFixed(2)} ${this.currency}`;
	}
}
