import type { DomainEvent } from "../../../shared/domain/events/domain-event";
import type { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import type { Currency } from "../value-objects/currency.vo";

export class OrderConfirmedEvent implements DomainEvent {
	public readonly occurredAt: Date;

	constructor(
		public readonly orderId: UuidV7,
		public readonly customerId: UuidV7,
		public readonly totalAmount: number,
		public readonly totalCurrency: Currency,
	) {
		this.occurredAt = new Date();
	}

	toString(): string {
		return `[OrderConfirmedEvent] Order ${this.orderId} confirmed for customer ${this.customerId} — Total: ${this.totalAmount.toFixed(2)} ${this.totalCurrency} at ${this.occurredAt.toISOString()}`;
	}
}
