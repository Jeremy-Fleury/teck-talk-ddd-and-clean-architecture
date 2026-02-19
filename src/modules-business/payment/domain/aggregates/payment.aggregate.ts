import { CreditTransfer } from '@/modules-business/payment/domain/entities/credit-transfer.entity';
import { PAYMENT_STATUS } from '@/modules-business/payment/domain/enums/payment.enums';
import { PaymentClearedEvent, PaymentInitiatedEvent, PaymentRejectedEvent, PaymentSettledEvent } from '@/modules-business/payment/domain/events/payment.events';
import { Money } from '@/modules-business/payment/domain/value-objects/money.vo';
import { Party } from '@/modules-business/payment/domain/value-objects/party.vo';
import type { CreateCreditTransferInput, CreditTransferPrimitives } from '@/modules-business/payment/domain/entities/credit-transfer.entity';
import type { PaymentStatus, ServiceLevel } from '@/modules-business/payment/domain/enums/payment.enums';
import type { DomainEvent } from '@/modules-business/payment/domain/events/payment.events';
import type { PartyPrimitives } from '@/modules-business/payment/domain/value-objects/party.vo';

import { InvalidTransitionDomainError, ValidationDomainError } from '@/libs/errors/domain.error';
import { Uuid } from '@/libs/value-objects/uuid.vo';

const RANDOM_STRING_RADIX = 36;
const RANDOM_STRING_START = 2;
const RANDOM_STRING_END = 10;
const ISO_DATE_LENGTH = 10;

interface PaymentProps {
	creationDateTime: Date;
	creditTransfers: CreditTransfer[];
	debtor: Party;
	id: Uuid;
	messageId: string;
	rejectionReason: string | null;
	requestedExecutionDate: Date;
	serviceLevel: ServiceLevel;
	settlementDate: Date | null;
	status: PaymentStatus;
}

export interface PaymentPrimitives {
	controlSum: number;
	creationDateTime: string;
	creditTransfers: CreditTransferPrimitives[];
	currency: string;
	debtor: PartyPrimitives;
	id: string;
	messageId: string;
	numberOfTransactions: number;
	rejectionReason: string | null;
	requestedExecutionDate: string;
	serviceLevel: ServiceLevel;
	settlementDate: string | null;
	status: PaymentStatus;
}

export interface CreatePaymentInput {
	creditTransfers: CreateCreditTransferInput[];
	debtor: {
		bic: string;
		country: string;
		iban: string;
		name: string;
	};
	requestedExecutionDate: Date;
	serviceLevel: ServiceLevel;
}

/**
 * Payment — Aggregate Root
 *
 * Corresponds to the ISO 20022 message pain.001 (CustomerCreditTransferInitiation).
 *
 * ISO 20022 structure:
 *
 * ```XML
 * <CstmrCdtTrfInitn>
 *   <GrpHdr>        → messageId, creationDateTime, numberOfTransactions, controlSum
 *   <PmtInf>        → debtor, serviceLevel, requestedExecutionDate
 *     <CdtTrfTxInf> → CreditTransfer[] (individual credit transfers)
 * ```
 *
 * The Aggregate Root protects business invariants:
 *
 *   1. A Payment must contain at least 1 CreditTransfer
 *   2. All transactions must use the same currency
 *   3. The CtrlSum (control sum) must match the total of all amounts
 *   4. The requested execution date cannot be in the past
 *   5. Status transitions follow a strict order
 */
export class Payment {
	private readonly _id: Uuid;
	private readonly _messageId: string;
	private readonly _creationDateTime: Date;
	private _status: PaymentStatus;
	private readonly _serviceLevel: ServiceLevel;
	private readonly _requestedExecutionDate: Date;
	private readonly _debtor: Party;
	private readonly _creditTransfers: CreditTransfer[];
	private _settlementDate: Date | null;
	private _rejectionReason: string | null;
	private _domainEvents: DomainEvent[] = [];

	private constructor(props: PaymentProps) {
		this._id = props.id;
		this._messageId = props.messageId;
		this._creationDateTime = props.creationDateTime;
		this._status = props.status;
		this._serviceLevel = props.serviceLevel;
		this._requestedExecutionDate = props.requestedExecutionDate;
		this._debtor = props.debtor;
		this._creditTransfers = props.creditTransfers;
		this._settlementDate = props.settlementDate;
		this._rejectionReason = props.rejectionReason;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(input: CreatePaymentInput): Payment {
		if (input.creditTransfers.length === 0) {
			throw new ValidationDomainError('A payment must contain at least one credit transfer.', {});
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (input.requestedExecutionDate < today) {
			throw new ValidationDomainError('Requested execution date cannot be in the past.', {
				requestedExecutionDate: input.requestedExecutionDate.toISOString(),
			});
		}

		const creditTransfers = input.creditTransfers.map((ct) => CreditTransfer.create(ct));

		const currencies = new Set(creditTransfers.map((ct) => ct.amount.currency));

		if (currencies.size > 1) {
			throw new ValidationDomainError('All credit transfers in a payment must use the same currency.', {});
		}

		const payment = new Payment({
			id: Uuid.generate(),
			messageId: Payment._generateMessageId(),
			creationDateTime: new Date(),
			status: PAYMENT_STATUS.initiated,
			serviceLevel: input.serviceLevel,
			requestedExecutionDate: input.requestedExecutionDate,
			debtor: Party.create({
				name: input.debtor.name,
				account: input.debtor.iban,
				agent: input.debtor.bic,
				country: input.debtor.country,
			}),
			creditTransfers,
			settlementDate: null,
			rejectionReason: null,
		});

		payment._domainEvents.push(new PaymentInitiatedEvent(payment._id.toString(), payment._debtor.name, payment.controlSum, payment.currency, payment.numberOfTransactions));

		return payment;
	}

	static fromPrimitives(primitives: PaymentPrimitives): Payment {
		return new Payment({
			id: Uuid.create(primitives.id),
			messageId: primitives.messageId,
			creationDateTime: new Date(primitives.creationDateTime),
			status: primitives.status,
			serviceLevel: primitives.serviceLevel,
			requestedExecutionDate: new Date(primitives.requestedExecutionDate),
			debtor: Party.create(primitives.debtor),
			creditTransfers: primitives.creditTransfers.map((ct) => CreditTransfer.fromPrimitives(ct)),
			settlementDate: primitives.settlementDate ? new Date(primitives.settlementDate) : null,
			rejectionReason: primitives.rejectionReason,
		});
	}

	// ─── Getters ────────────────────────────────────────────────

	get id(): Uuid {
		return this._id;
	}

	get messageId(): string {
		return this._messageId;
	}

	get creationDateTime(): Date {
		return this._creationDateTime;
	}

	get status(): PaymentStatus {
		return this._status;
	}

	get serviceLevel(): ServiceLevel {
		return this._serviceLevel;
	}

	get requestedExecutionDate(): Date {
		return this._requestedExecutionDate;
	}

	get debtor(): Party {
		return this._debtor;
	}

	get creditTransfers(): readonly CreditTransfer[] {
		return [...this._creditTransfers];
	}

	get settlementDate(): Date | null {
		return this._settlementDate;
	}

	get rejectionReason(): string | null {
		return this._rejectionReason;
	}

	get domainEvents(): readonly DomainEvent[] {
		return [...this._domainEvents];
	}

	// ─── Computed ───────────────────────────────────────────────

	/**
	 * ISO 20022:
	 * ```XML
	 * <NbOfTxs>
	 * ```
	 * Number of individual transactions in the message.
	 */
	get numberOfTransactions(): number {
		return this._creditTransfers.length;
	}

	/**
	 * ISO 20022:
	 * ```XML
	 * <CtrlSum>
	 * ```
	 * Total of all amounts — used as an integrity check.
	 * If a transfer is lost in transit, the CtrlSum will no longer match.
	 */
	get controlSum(): number {
		return this._creditTransfers.reduce((sum, ct) => sum + ct.amount.amount, 0);
	}

	/**
	 * Common currency across all transactions.
	 * Guaranteed by the invariant checked in
	 * ```TS
	 * Payment.create()
	 * ```
	 */
	get currency(): string {
		const firstTransfer = this._creditTransfers[0];

		if (!firstTransfer) {
			throw new ValidationDomainError('Payment must contain at least one credit transfer.', {});
		}

		return firstTransfer.amount.currency;
	}

	/**
	 * Total amount as a Money Value Object.
	 */
	get totalAmount(): Money {
		return this._creditTransfers.reduce((total, ct) => total.add(ct.amount), Money.create(0, this.currency));
	}

	// ─── Behaviors ──────────────────────────────────────────────

	/**
	 * The payment has been cleared (interbank clearing)
	 *
	 * Triggered when a pacs.002 is received with
	 * ```XML
	 * <TxSts>ACCC</TxSts>
	 * ```
	 * The clearing reference identifies the operation in the clearing system.
	 *
	 * Transition: Initiated → Cleared
	 */
	markAsCleared(clearingReference: string): void {
		this._assertStatus(PAYMENT_STATUS.initiated, 'clear');

		if (clearingReference.trim().length === 0) {
			throw new ValidationDomainError('Clearing reference is required.', {
				clearingReference,
			});
		}

		this._status = PAYMENT_STATUS.cleared;

		this._domainEvents.push(new PaymentClearedEvent(this._id.toString(), clearingReference));
	}

	/**
	 * The payment has been settled (credited to the beneficiary's account)
	 *
	 * Triggered when a pacs.002 is received with <TxSts>ACSC</TxSts>.
	 * The settlement date is the effective settlement date (<IntrBkSttlmDt>).
	 *
	 * Transition: Cleared → Settled
	 */
	markAsSettled(settlementDate: Date): void {
		this._assertStatus(PAYMENT_STATUS.cleared, 'settle');

		this._status = PAYMENT_STATUS.settled;
		this._settlementDate = settlementDate;

		this._domainEvents.push(new PaymentSettledEvent(this._id.toString(), settlementDate.toISOString().substring(0, ISO_DATE_LENGTH)));
	}

	/**
	 * The payment is rejected
	 *
	 * Triggered when a pacs.002 is received with <TxSts>RJCT</TxSts>
	 * and a reason code in <Rsn><Cd>.
	 *
	 * ISO 20022 reason code examples:
	 *   - AC01: IncorrectAccountNumber
	 *   - AC04: ClosedAccountNumber
	 *   - AM04: InsufficientFunds
	 *   - BE04: MissingCreditorAddress
	 *   - AG01: TransactionForbidden
	 *
	 * Transition: Initiated | Cleared → Rejected
	 */
	reject(reasonCode: string): void {
		const rejectableStatuses: PaymentStatus[] = [PAYMENT_STATUS.initiated, PAYMENT_STATUS.cleared];

		if (!rejectableStatuses.includes(this._status)) {
			throw new InvalidTransitionDomainError(`Cannot reject payment in status "${this._status}".`, {
				currentStatus: this._status,
			});
		}

		if (reasonCode.trim().length === 0) {
			throw new ValidationDomainError('Rejection reason code is required.', {
				reasonCode,
			});
		}

		this._status = PAYMENT_STATUS.rejected;
		this._rejectionReason = reasonCode;

		this._domainEvents.push(new PaymentRejectedEvent(this._id.toString(), reasonCode));
	}

	clearDomainEvents(): void {
		this._domainEvents = [];
	}

	// ─── Serialization ──────────────────────────────────────────

	toPrimitives(): PaymentPrimitives {
		return {
			id: this._id.toString(),
			messageId: this._messageId,
			creationDateTime: this._creationDateTime.toISOString(),
			status: this._status,
			serviceLevel: this._serviceLevel,
			requestedExecutionDate: this._requestedExecutionDate.toISOString().substring(0, ISO_DATE_LENGTH),
			debtor: this._debtor.toPrimitives(),
			creditTransfers: this._creditTransfers.map((ct) => ct.toPrimitives()),
			numberOfTransactions: this.numberOfTransactions,
			controlSum: this.controlSum,
			currency: this.currency,
			settlementDate: this._settlementDate ? this._settlementDate.toISOString().substring(0, ISO_DATE_LENGTH) : null,
			rejectionReason: this._rejectionReason,
		};
	}

	// ─── Private methods ────────────────────────────────────────

	private _assertStatus(expected: PaymentStatus, action: string): void {
		if (this._status !== expected) {
			throw new InvalidTransitionDomainError(`Cannot ${action} payment in status "${this._status}" (expected "${expected}").`, {
				currentStatus: this._status,
				expectedStatus: expected,
			});
		}
	}

	private static _generateMessageId(): string {
		const timestamp = Date.now();
		const random = Math.random().toString(RANDOM_STRING_RADIX).substring(RANDOM_STRING_START, RANDOM_STRING_END);
		return `MSG-${timestamp}-${random}`;
	}
}
