import type { UuidV7 } from "../../../shared/domain/value-objects/uuid-v7.vo";
import type { Order } from "../aggregates/order.aggregate";

export interface OrderRepository {
	findById(id: UuidV7): Promise<Order | null>;
	save(order: Order): Promise<void>;
}
