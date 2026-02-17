import type { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import type { Money } from "../value-objects/money.vo";

export class OrderItem {
	private constructor(
		public readonly id: UuidV7,
		public readonly productId: UuidV7,
		public readonly quantity: number,
		public readonly unitPrice: Money,
		public readonly subtotal: Money,
	) {}

	static create(id: UuidV7, productId: UuidV7, quantity: number, unitPrice: Money): OrderItem {
		if (quantity <= 0) {
			throw new Error("Quantity must be greater than 0");
		}
		const subtotal = unitPrice.multiply(quantity);
		return new OrderItem(id, productId, quantity, unitPrice, subtotal);
	}

	equals(other: OrderItem): boolean {
		return this.id.equals(other.id);
	}
}
