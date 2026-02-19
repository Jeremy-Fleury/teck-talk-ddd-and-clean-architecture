import { Payment } from '@/modules-business/payment/domain/aggregates/payment.aggregate';
import { PAYMENT_STATUS, SERVICE_LEVEL } from '@/modules-business/payment/domain/enums/payment.enums';
import { PaymentClearedEvent, PaymentInitiatedEvent, PaymentRejectedEvent, PaymentSettledEvent } from '@/modules-business/payment/domain/events/payment.events';
import type { CreatePaymentInput } from '@/modules-business/payment/domain/aggregates/payment.aggregate';
import type { CreateCreditTransferInput } from '@/modules-business/payment/domain/entities/credit-transfer.entity';

import { InvalidTransitionDomainError, ValidationDomainError } from '@/libs/errors/domain.error';

const VALID_CREDIT_TRANSFER: CreateCreditTransferInput = {
	amount: 1000,
	currency: 'EUR',
	creditorName: 'Jane Doe',
	creditorIban: 'FR7630006000011234567890189',
	creditorBic: 'BNPAFRPP',
	creditorCountry: 'FR',
	endToEndId: 'E2E-001',
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const VALID_INPUT: CreatePaymentInput = {
	debtor: {
		name: 'John Doe',
		iban: 'DE89370400440532013000',
		bic: 'COBADEFFXXX',
		country: 'DE',
	},
	creditTransfers: [VALID_CREDIT_TRANSFER],
	requestedExecutionDate: tomorrow,
	serviceLevel: SERVICE_LEVEL.sepa,
};

describe('Payment', () => {
	describe('happy path', () => {
		it('should create a valid Payment with one credit transfer', () => {
			// Arrange
			const input = VALID_INPUT;

			// Act
			const payment = Payment.create(input);

			// Assert
			expect(payment.id).toBeDefined();
			expect(payment.messageId).toMatch(/^MSG-/);
			expect(payment.status).toBe(PAYMENT_STATUS.initiated);
			expect(payment.serviceLevel).toBe(SERVICE_LEVEL.sepa);
			expect(payment.debtor.name).toBe('John Doe');
			expect(payment.numberOfTransactions).toBe(1);
			expect(payment.controlSum).toBe(1000);
			expect(payment.currency).toBe('EUR');
			expect(payment.settlementDate).toBeNull();
			expect(payment.rejectionReason).toBeNull();
		});

		it('should create a Payment with multiple credit transfers', () => {
			// Arrange
			const secondTransfer: CreateCreditTransferInput = {
				...VALID_CREDIT_TRANSFER,
				amount: 500,
				endToEndId: 'E2E-002',
			};
			const input = { ...VALID_INPUT, creditTransfers: [VALID_CREDIT_TRANSFER, secondTransfer] };

			// Act
			const payment = Payment.create(input);

			// Assert
			expect(payment.numberOfTransactions).toBe(2);
			expect(payment.controlSum).toBe(1500);
			expect(payment.creditTransfers).toHaveLength(2);
		});

		it('should emit a PaymentInitiatedEvent on creation', () => {
			// Arrange
			const input = VALID_INPUT;

			// Act
			const payment = Payment.create(input);

			// Assert
			expect(payment.domainEvents).toHaveLength(1);
			expect(payment.domainEvents[0]).toBeInstanceOf(PaymentInitiatedEvent);
		});

		it('should return the total amount as Money', () => {
			// Arrange
			const secondTransfer: CreateCreditTransferInput = {
				...VALID_CREDIT_TRANSFER,
				amount: 250,
				endToEndId: 'E2E-002',
			};
			const input = { ...VALID_INPUT, creditTransfers: [VALID_CREDIT_TRANSFER, secondTransfer] };
			const payment = Payment.create(input);

			// Act
			const totalAmount = payment.totalAmount;

			// Assert
			expect(totalAmount.amount).toBe(1250);
			expect(totalAmount.currency).toBe('EUR');
		});

		it('should clear domain events', () => {
			// Arrange
			const payment = Payment.create(VALID_INPUT);

			// Act
			payment.clearDomainEvents();

			// Assert
			expect(payment.domainEvents).toHaveLength(0);
		});

		it('should serialize to primitives and reconstruct via fromPrimitives', () => {
			// Arrange
			const payment = Payment.create(VALID_INPUT);
			const primitives = payment.toPrimitives();

			// Act
			const restored = Payment.fromPrimitives(primitives);

			// Assert
			expect(restored.id.toString()).toBe(payment.id.toString());
			expect(restored.messageId).toBe(payment.messageId);
			expect(restored.status).toBe(PAYMENT_STATUS.initiated);
			expect(restored.numberOfTransactions).toBe(1);
			expect(restored.controlSum).toBe(1000);
			expect(restored.debtor.name).toBe('John Doe');
		});

		it('should return a defensive copy of creditTransfers', () => {
			// Arrange
			const payment = Payment.create(VALID_INPUT);

			// Act
			const transfers1 = payment.creditTransfers;
			const transfers2 = payment.creditTransfers;

			// Assert
			expect(transfers1).not.toBe(transfers2);
			expect(transfers1).toHaveLength(transfers2.length);
		});
	});

	describe('markAsCleared', () => {
		describe('happy path', () => {
			it('should transition from initiated to cleared', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.clearDomainEvents();

				// Act
				payment.markAsCleared('CLR-REF-001');

				// Assert
				expect(payment.status).toBe(PAYMENT_STATUS.cleared);
			});

			it('should emit a PaymentClearedEvent', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.clearDomainEvents();

				// Act
				payment.markAsCleared('CLR-REF-001');

				// Assert
				expect(payment.domainEvents).toHaveLength(1);
				expect(payment.domainEvents[0]).toBeInstanceOf(PaymentClearedEvent);
			});
		});

		describe('errors', () => {
			it('should reject clearing with an empty reference', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);

				// Act
				const act = () => payment.markAsCleared('');

				// Assert
				expect(act).toThrow(ValidationDomainError);
			});

			it('should reject clearing with whitespace-only reference', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);

				// Act
				const act = () => payment.markAsCleared('   ');

				// Assert
				expect(act).toThrow(ValidationDomainError);
			});

			it('should reject clearing from cleared status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');

				// Act
				const act = () => payment.markAsCleared('CLR-REF-002');

				// Assert
				expect(act).toThrow(InvalidTransitionDomainError);
			});
		});
	});

	describe('markAsSettled', () => {
		describe('happy path', () => {
			it('should transition from cleared to settled', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');
				payment.clearDomainEvents();
				const settlementDate = new Date('2025-06-15');

				// Act
				payment.markAsSettled(settlementDate);

				// Assert
				expect(payment.status).toBe(PAYMENT_STATUS.settled);
				expect(payment.settlementDate).toEqual(settlementDate);
			});

			it('should emit a PaymentSettledEvent', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');
				payment.clearDomainEvents();

				// Act
				payment.markAsSettled(new Date('2025-06-15'));

				// Assert
				expect(payment.domainEvents).toHaveLength(1);
				expect(payment.domainEvents[0]).toBeInstanceOf(PaymentSettledEvent);
			});
		});

		describe('errors', () => {
			it('should reject settling from initiated status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);

				// Act
				const act = () => payment.markAsSettled(new Date());

				// Assert
				expect(act).toThrow(InvalidTransitionDomainError);
			});

			it('should reject settling from settled status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');
				payment.markAsSettled(new Date('2025-06-15'));

				// Act
				const act = () => payment.markAsSettled(new Date('2025-06-16'));

				// Assert
				expect(act).toThrow(InvalidTransitionDomainError);
			});
		});
	});

	describe('reject', () => {
		describe('happy path', () => {
			it('should reject from initiated status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.clearDomainEvents();

				// Act
				payment.reject('AC01');

				// Assert
				expect(payment.status).toBe(PAYMENT_STATUS.rejected);
				expect(payment.rejectionReason).toBe('AC01');
			});

			it('should reject from cleared status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');
				payment.clearDomainEvents();

				// Act
				payment.reject('AM04');

				// Assert
				expect(payment.status).toBe(PAYMENT_STATUS.rejected);
				expect(payment.rejectionReason).toBe('AM04');
			});

			it('should emit a PaymentRejectedEvent', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.clearDomainEvents();

				// Act
				payment.reject('AC01');

				// Assert
				expect(payment.domainEvents).toHaveLength(1);
				expect(payment.domainEvents[0]).toBeInstanceOf(PaymentRejectedEvent);
			});
		});

		describe('errors', () => {
			it('should reject with an empty reason code', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);

				// Act
				const act = () => payment.reject('');

				// Assert
				expect(act).toThrow(ValidationDomainError);
			});

			it('should reject with whitespace-only reason code', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);

				// Act
				const act = () => payment.reject('   ');

				// Assert
				expect(act).toThrow(ValidationDomainError);
			});

			it('should reject from settled status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.markAsCleared('CLR-REF-001');
				payment.markAsSettled(new Date());

				// Act
				const act = () => payment.reject('AC01');

				// Assert
				expect(act).toThrow(InvalidTransitionDomainError);
			});

			it('should reject from already rejected status', () => {
				// Arrange
				const payment = Payment.create(VALID_INPUT);
				payment.reject('AC01');

				// Act
				const act = () => payment.reject('AM04');

				// Assert
				expect(act).toThrow(InvalidTransitionDomainError);
			});
		});
	});

	describe('errors', () => {
		it('should reject a payment with no credit transfers', () => {
			// Arrange
			const input = { ...VALID_INPUT, creditTransfers: [] };

			// Act
			const act = () => Payment.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a payment with execution date in the past', () => {
			// Arrange
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const input = { ...VALID_INPUT, requestedExecutionDate: yesterday };

			// Act
			const act = () => Payment.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a payment with mixed currencies', () => {
			// Arrange
			const usdTransfer: CreateCreditTransferInput = {
				...VALID_CREDIT_TRANSFER,
				currency: 'USD',
				endToEndId: 'E2E-002',
			};
			const input = { ...VALID_INPUT, creditTransfers: [VALID_CREDIT_TRANSFER, usdTransfer] };

			// Act
			const act = () => Payment.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a payment with invalid debtor IBAN', () => {
			// Arrange
			const input = { ...VALID_INPUT, debtor: { ...VALID_INPUT.debtor, iban: 'INVALID' } };

			// Act
			const act = () => Payment.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a payment with invalid debtor BIC', () => {
			// Arrange
			const input = { ...VALID_INPUT, debtor: { ...VALID_INPUT.debtor, bic: 'BAD' } };

			// Act
			const act = () => Payment.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
