/**
 * PaymentStatus — Payment status
 *
 * Aligned with ISO 20022 codes from the <TxSts> field in pacs.002 (PaymentStatusReport).
 * Each status maps to a standardized code understood by all banks.
 */
export const PAYMENT_STATUS = {
	/** ACSP — AcceptedSettlementInProcess: the payment is accepted and being processed */
	initiated: 'ACSP',

	/** PDNG — Pending: awaiting processing (e.g. screening in progress) */
	pending: 'PDNG',

	/** ACWC — AcceptedWithChange: accepted after screening, possibly modified */
	screened: 'ACWC',

	/** ACCC — AcceptedSettlementCompleted: cleared between banks */
	cleared: 'ACCC',

	/** ACSC — AcceptedSettlementCompletedCreditorAccount: settled on the creditor's account */
	settled: 'ACSC',

	/** RJCT — Rejected: rejected */
	rejected: 'RJCT',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * ServiceLevel — Payment service level
 *
 * ISO 20022: <PmtTpInf><SvcLvl><Cd>
 * Determines the "route" taken by the payment (SEPA, SWIFT gpi, urgent, etc.)
 */
export const SERVICE_LEVEL = {
	/** SEPA Credit Transfer — eurozone, D+1 */
	sepa: 'SEPA',

	/** Urgent / Priority — same day */
	urgent: 'URGP',

	/** Normal / Non-urgent */
	normal: 'NURG',

	/** SWIFT gpi — end-to-end tracking, speed SLA */
	swiftGpi: 'G001',
} as const;

export type ServiceLevel = (typeof SERVICE_LEVEL)[keyof typeof SERVICE_LEVEL];
