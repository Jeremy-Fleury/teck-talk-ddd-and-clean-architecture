/**
 * Domain Events for the Payment bounded context
 *
 * Each event corresponds to a transition in the payment lifecycle.
 * In ISO 20022, these transitions are materialized by messages:
 *   - PaymentInitiated   → pain.001 sent to the bank
 *   - PaymentCleared     → pacs.002 received with <TxSts>ACCC
 *   - PaymentSettled     → pacs.002 received with <TxSts>ACSC
 *   - PaymentRejected    → pacs.002 received with <TxSts>RJCT + <Rsn><Cd>
 */

interface DomainEventProps {
	occurredAt: Date;
	paymentId: string;
}

export abstract class DomainEvent {
	readonly occurredAt: Date;
	readonly paymentId: string;
	abstract readonly eventType: string;

	protected constructor(props: DomainEventProps) {
		this.occurredAt = props.occurredAt;
		this.paymentId = props.paymentId;
	}
}

export class PaymentInitiatedEvent extends DomainEvent {
	readonly eventType = 'payment.initiated';
	readonly debtorName: string;
	readonly totalAmount: number;
	readonly currency: string;
	readonly numberOfTransfers: number;

	constructor(paymentId: string, debtorName: string, totalAmount: number, currency: string, numberOfTransfers: number) {
		super({ paymentId, occurredAt: new Date() });
		this.debtorName = debtorName;
		this.totalAmount = totalAmount;
		this.currency = currency;
		this.numberOfTransfers = numberOfTransfers;
	}
}

export class PaymentClearedEvent extends DomainEvent {
	readonly eventType = 'payment.cleared';
	readonly clearingReference: string;

	constructor(paymentId: string, clearingReference: string) {
		super({ paymentId, occurredAt: new Date() });
		this.clearingReference = clearingReference;
	}
}

export class PaymentSettledEvent extends DomainEvent {
	readonly eventType = 'payment.settled';
	readonly settlementDate: string;

	constructor(paymentId: string, settlementDate: string) {
		super({ paymentId, occurredAt: new Date() });
		this.settlementDate = settlementDate;
	}
}

export class PaymentRejectedEvent extends DomainEvent {
	readonly eventType = 'payment.rejected';
	readonly reasonCode: string;

	constructor(paymentId: string, reasonCode: string) {
		super({ paymentId, occurredAt: new Date() });
		this.reasonCode = reasonCode;
	}
}
