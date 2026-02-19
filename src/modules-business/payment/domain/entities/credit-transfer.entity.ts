import { EndToEndId } from '@/modules-business/payment/domain/value-objects/end-to-end-id.vo';
import { Money } from '@/modules-business/payment/domain/value-objects/money.vo';
import { Party } from '@/modules-business/payment/domain/value-objects/party.vo';
import type { PartyPrimitives } from '@/modules-business/payment/domain/value-objects/party.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';
import { Uuid } from '@/libs/value-objects/uuid.vo';

const MAX_REMITTANCE_LENGTH = 140;

interface CreditTransferProps {
	amount: Money;
	creditor: Party;
	endToEndId: EndToEndId;
	id: Uuid;
	remittanceInfo: string | null;
}

export interface CreditTransferPrimitives {
	amount: number;
	creditor: PartyPrimitives;
	currency: string;
	endToEndId: string;
	id: string;
	remittanceInfo: string | null;
}

export interface CreateCreditTransferInput {
	amount: number;
	creditorBic: string;
	creditorCountry: string;
	creditorIban: string;
	creditorName: string;
	currency: string;
	endToEndId: string;
	remittanceInfo?: string;
}

/**
 * CreditTransfer — Individual transaction within a payment
 *
 * ISO 20022:
 * ```XML
 * <CdtTrfTxInf> (CreditTransferTransactionInformation)
 * ```
 * Contained within a Payment, this is an Entity (not an Aggregate Root).
 *
 * A Payment can contain 1 to N CreditTransfers.
 * Each CreditTransfer has its own EndToEndId, amount, and creditor.
 * The debtor is shared at the Payment level.
 *
 * ISO 20022 constraint:
 * ```XML
 *   <RmtInf>
 *     <Ustrd> Unstructured remittance information, max 140 characters </Ustrd>
 *   </RmtInf>
 * ```
 */
export class CreditTransfer {
	private readonly _id: Uuid;
	private readonly _endToEndId: EndToEndId;
	private readonly _amount: Money;
	private readonly _creditor: Party;
	private readonly _remittanceInfo: string | null;

	private constructor(props: CreditTransferProps) {
		this._id = props.id;
		this._endToEndId = props.endToEndId;
		this._amount = props.amount;
		this._creditor = props.creditor;
		this._remittanceInfo = props.remittanceInfo;
	}

	// ─── Factories ──────────────────────────────────────────────

	static create(input: CreateCreditTransferInput): CreditTransfer {
		CreditTransfer._validateRemittanceInfo(input.remittanceInfo ?? null);

		return new CreditTransfer({
			id: Uuid.generate(),
			endToEndId: EndToEndId.create(input.endToEndId),
			amount: Money.create(input.amount, input.currency),
			creditor: Party.create({
				name: input.creditorName,
				account: input.creditorIban,
				agent: input.creditorBic,
				country: input.creditorCountry,
			}),
			remittanceInfo: input.remittanceInfo ?? null,
		});
	}

	static fromPrimitives(primitives: CreditTransferPrimitives): CreditTransfer {
		return new CreditTransfer({
			id: Uuid.create(primitives.id),
			endToEndId: EndToEndId.create(primitives.endToEndId),
			amount: Money.create(primitives.amount, primitives.currency),
			creditor: Party.create(primitives.creditor),
			remittanceInfo: primitives.remittanceInfo,
		});
	}

	// ─── Getters ────────────────────────────────────────────────

	get id(): Uuid {
		return this._id;
	}

	get endToEndId(): EndToEndId {
		return this._endToEndId;
	}

	get amount(): Money {
		return this._amount;
	}

	get creditor(): Party {
		return this._creditor;
	}

	get remittanceInfo(): string | null {
		return this._remittanceInfo;
	}

	// ─── Serialization ──────────────────────────────────────────

	toPrimitives(): CreditTransferPrimitives {
		return {
			id: this._id.toString(),
			endToEndId: this._endToEndId.toString(),
			amount: this._amount.amount,
			currency: this._amount.currency,
			creditor: this._creditor.toPrimitives(),
			remittanceInfo: this._remittanceInfo,
		};
	}

	// ─── Private methods ────────────────────────────────────────

	private static _validateRemittanceInfo(remittanceInfo: string | null): void {
		if (remittanceInfo && remittanceInfo.length > MAX_REMITTANCE_LENGTH) {
			throw new ValidationDomainError(`Remittance info cannot exceed ${MAX_REMITTANCE_LENGTH} characters (ISO 20022).`, { remittanceInfo });
		}
	}
}
