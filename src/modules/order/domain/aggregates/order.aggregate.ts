import { Aggregate } from "../../../shared/domain/aggregates/aggregate";
import type { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import { OrderItem } from "../entities/order-item.entity";
import { OrderConfirmedEvent } from "../events/order-confirmed.event";
import { Currency } from "../value-objects/currency.vo";
import { Money } from "../value-objects/money.vo";
import { OrderStatus } from "../value-objects/order-status.vo";

export class Order extends Aggregate {
	public readonly customerId: UuidV7;
	private _items: OrderItem[];
	private _status: OrderStatus;

	private constructor(id: UuidV7, customerId: UuidV7, items: OrderItem[], status: OrderStatus) {
		super(id);
		this.customerId = customerId;
		this._items = items;
		this._status = status;
	}

	// --- Factory ---

	static create(id: UuidV7, customerId: UuidV7): Order {
		const items: OrderItem[] = [];
		const status = OrderStatus.draft();

		return new Order(id, customerId, items, status);
	}

	// --- Getters (accès contrôlé) ---

	get items(): readonly OrderItem[] {
		return [...this._items];
	}

	get status(): OrderStatus {
		return this._status;
	}

	// --- Comportements métier (la Root protège les invariants) ---

	addItem(itemId: UuidV7, productId: UuidV7, quantity: number, unitPrice: Money): void {
		if (!this._status.equals(OrderStatus.draft())) {
			throw new Error("Cannot add items to a non-DRAFT order");
		}
		const item = OrderItem.create(itemId, productId, quantity, unitPrice);
		this._items.push(item);
	}

	confirm(): void {
		if (this._items.length === 0) {
			throw new Error("Cannot confirm an order with no items");
		}

		const confirmed = OrderStatus.create("CONFIRMED");
		this._status = this._status.transitionTo(confirmed);

		const total = this.calculateTotal();
		this.addDomainEvent(new OrderConfirmedEvent(this.id, this.customerId, total.amount, total.currency));
	}

	calculateTotal(): Money {
		if (this._items.length === 0) {
			return Money.create(0, Currency.EUR());
		}
		return this._items.reduce(
			(sum, item) => sum.add(item.subtotal),
			Money.create(0, this._items[0].unitPrice.currency),
		);
	}
}
