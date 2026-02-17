import type { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import type { Order } from "../../domain/aggregates/order.aggregate";
import type { OrderRepository } from "../../domain/repositories/order.repository";

export class InMemoryOrderRepository implements OrderRepository {
	private orders = new Map<string, Order>();

	async findById(id: UuidV7): Promise<Order | null> {
		return this.orders.get(id.value) ?? null;
	}

	async save(order: Order): Promise<void> {
		this.orders.set(order.id.value, order);
	}
}
