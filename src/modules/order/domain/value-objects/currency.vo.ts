const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP", "CHF", "CAD"] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export class Currency {
	private constructor(public readonly code: SupportedCurrency) {}

	static create(code: string): Currency {
		const upper = code.toUpperCase().trim();
		if (!SUPPORTED_CURRENCIES.includes(upper as SupportedCurrency)) {
			throw new Error(`Unsupported currency: ${code}. Valid: ${SUPPORTED_CURRENCIES.join(", ")}`);
		}
		return new Currency(upper as SupportedCurrency);
	}

	static EUR(): Currency {
		return new Currency("EUR");
	}

	static USD(): Currency {
		return new Currency("USD");
	}

	equals(other: Currency): boolean {
		return this.code === other.code;
	}

	toString(): string {
		return this.code;
	}
}
