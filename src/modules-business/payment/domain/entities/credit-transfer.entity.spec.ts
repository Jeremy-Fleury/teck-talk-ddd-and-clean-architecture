import { CreditTransfer } from '@/modules-business/payment/domain/entities/credit-transfer.entity';
import type { CreateCreditTransferInput } from '@/modules-business/payment/domain/entities/credit-transfer.entity';

import { ValidationDomainError } from '@/libs/errors/domain.error';

const VALID_INPUT: CreateCreditTransferInput = {
	amount: 1000,
	currency: 'EUR',
	creditorName: 'Jane Doe',
	creditorIban: 'FR7630006000011234567890189',
	creditorBic: 'BNPAFRPP',
	creditorCountry: 'FR',
	endToEndId: 'E2E-001',
};

describe('CreditTransfer', () => {
	describe('happy path', () => {
		it('should create a valid CreditTransfer', () => {
			// Arrange
			const input = VALID_INPUT;

			// Act
			const ct = CreditTransfer.create(input);

			// Assert
			expect(ct.id).toBeDefined();
			expect(ct.endToEndId.toString()).toBe('E2E-001');
			expect(ct.amount.amount).toBe(1000);
			expect(ct.amount.currency).toBe('EUR');
			expect(ct.creditor.name).toBe('Jane Doe');
			expect(ct.creditor.account.toString()).toBe('FR7630006000011234567890189');
			expect(ct.creditor.agent.toString()).toBe('BNPAFRPP');
			expect(ct.creditor.country).toBe('FR');
		});

		it('should set remittanceInfo to null when not provided', () => {
			// Arrange
			const input = VALID_INPUT;

			// Act
			const ct = CreditTransfer.create(input);

			// Assert
			expect(ct.remittanceInfo).toBeNull();
		});

		it('should set remittanceInfo when provided', () => {
			// Arrange
			const input = { ...VALID_INPUT, remittanceInfo: 'Invoice 2024-001' };

			// Act
			const ct = CreditTransfer.create(input);

			// Assert
			expect(ct.remittanceInfo).toBe('Invoice 2024-001');
		});

		it('should accept remittanceInfo of exactly 140 characters', () => {
			// Arrange
			const input = { ...VALID_INPUT, remittanceInfo: 'A'.repeat(140) };

			// Act
			const ct = CreditTransfer.create(input);

			// Assert
			expect(ct.remittanceInfo).toBe('A'.repeat(140));
		});

		it('should generate a unique id', () => {
			// Arrange
			const input = VALID_INPUT;

			// Act
			const ct1 = CreditTransfer.create(input);
			const ct2 = CreditTransfer.create(input);

			// Assert
			expect(ct1.id.toString()).not.toBe(ct2.id.toString());
		});

		it('should serialize to primitives and reconstruct via fromPrimitives', () => {
			// Arrange
			const ct = CreditTransfer.create({ ...VALID_INPUT, remittanceInfo: 'Test' });
			const primitives = ct.toPrimitives();

			// Act
			const restored = CreditTransfer.fromPrimitives(primitives);

			// Assert
			expect(restored.id.toString()).toBe(ct.id.toString());
			expect(restored.endToEndId.toString()).toBe('E2E-001');
			expect(restored.amount.amount).toBe(1000);
			expect(restored.amount.currency).toBe('EUR');
			expect(restored.creditor.name).toBe('Jane Doe');
			expect(restored.remittanceInfo).toBe('Test');
		});

		it('should return correct primitives structure', () => {
			// Arrange
			const ct = CreditTransfer.create(VALID_INPUT);

			// Act
			const primitives = ct.toPrimitives();

			// Assert
			expect(primitives).toEqual({
				id: expect.any(String),
				endToEndId: 'E2E-001',
				amount: 1000,
				currency: 'EUR',
				creditor: {
					name: 'Jane Doe',
					account: 'FR7630006000011234567890189',
					agent: 'BNPAFRPP',
					country: 'FR',
				},
				remittanceInfo: null,
			});
		});
	});

	describe('errors', () => {
		it('should reject remittanceInfo exceeding 140 characters', () => {
			// Arrange
			const input = { ...VALID_INPUT, remittanceInfo: 'A'.repeat(141) };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid creditor IBAN', () => {
			// Arrange
			const input = { ...VALID_INPUT, creditorIban: 'INVALID' };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid creditor BIC', () => {
			// Arrange
			const input = { ...VALID_INPUT, creditorBic: 'BAD' };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a negative amount', () => {
			// Arrange
			const input = { ...VALID_INPUT, amount: -100 };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid currency', () => {
			// Arrange
			const input = { ...VALID_INPUT, currency: 'EURO' };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an empty endToEndId', () => {
			// Arrange
			const input = { ...VALID_INPUT, endToEndId: '' };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an empty creditor name', () => {
			// Arrange
			const input = { ...VALID_INPUT, creditorName: '' };

			// Act
			const act = () => CreditTransfer.create(input);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
