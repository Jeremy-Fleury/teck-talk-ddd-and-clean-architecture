const VALID_TRANSITIONS: Record<string, string[]> = {
	DRAFT: ["CONFIRMED"],
	CONFIRMED: ["CANCELLED"],
	CANCELLED: [],
};

export class OrderStatus {
	private constructor(public readonly value: string) {}

	static create(value: string): OrderStatus {
		if (!VALID_TRANSITIONS[value]) {
			throw new Error(`Invalid order status: ${value}. Valid: ${Object.keys(VALID_TRANSITIONS).join(", ")}`);
		}
		return new OrderStatus(value);
	}

	static draft(): OrderStatus {
		return new OrderStatus("DRAFT");
	}

	canTransitionTo(next: OrderStatus): boolean {
		return VALID_TRANSITIONS[this.value]?.includes(next.value) ?? false;
	}

	transitionTo(next: OrderStatus): OrderStatus {
		if (!this.canTransitionTo(next)) {
			throw new Error(`Cannot transition from ${this.value} to ${next.value}`);
		}
		return next;
	}

	equals(other: OrderStatus): boolean {
		return this.value === other.value;
	}

	toString(): string {
		return this.value;
	}
}
