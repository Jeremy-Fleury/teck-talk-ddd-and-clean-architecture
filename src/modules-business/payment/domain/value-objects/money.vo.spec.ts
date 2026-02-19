import { Money } from '@/modules-business/payment/domain/value-objects/money.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

describe('Money', () => {
	describe('happy path', () => {
		it('should create a valid Money', () => {
			// Arrange
			const amount = 100;
			const currency = 'EUR';

			// Act
			const money = Money.create(amount, currency);

			// Assert
			expect(money.amount).toBe(100);
			expect(money.currency).toBe('EUR');
		});

		it('should accept zero amount', () => {
			// Arrange
			const amount = 0;
			const currency = 'EUR';

			// Act
			const money = Money.create(amount, currency);

			// Assert
			expect(money.amount).toBe(0);
		});

		it('should clean currency to uppercase', () => {
			// Arrange
			const amount = 100;
			const currency = 'eur';

			// Act
			const money = Money.create(amount, currency);

			// Assert
			expect(money.currency).toBe('EUR');
		});

		it('should trim currency whitespace', () => {
			// Arrange
			const amount = 100;
			const currency = '  EUR  ';

			// Act
			const money = Money.create(amount, currency);

			// Assert
			expect(money.currency).toBe('EUR');
		});

		it('should add two Money with the same currency', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(50, 'EUR');

			// Act
			const result = a.add(b);

			// Assert
			expect(result.amount).toBe(150);
			expect(result.currency).toBe('EUR');
		});

		it('should subtract two Money with the same currency', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(30, 'EUR');

			// Act
			const result = a.subtract(b);

			// Assert
			expect(result.amount).toBe(70);
			expect(result.currency).toBe('EUR');
		});

		it('should allow subtracting to zero', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(100, 'EUR');

			// Act
			const result = a.subtract(b);

			// Assert
			expect(result.amount).toBe(0);
		});

		it('should return true for same amount and currency', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(100, 'EUR');

			// Act
			const result = a.equals(b);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for different amounts', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(200, 'EUR');

			// Act
			const result = a.equals(b);

			// Assert
			expect(result).toBe(false);
		});

		it('should return false for different currencies', () => {
			// Arrange
			const a = Money.create(100, 'EUR');
			const b = Money.create(100, 'USD');

			// Act
			const result = a.equals(b);

			// Assert
			expect(result).toBe(false);
		});

		it('should format as "CURRENCY AMOUNT" with 2 decimals', () => {
			// Arrange
			const money = Money.create(12500, 'EUR');

			// Act
			const result = money.toString();

			// Assert
			expect(result).toBe('EUR 12500.00');
		});

		it('should format zero correctly', () => {
			// Arrange
			const money = Money.create(0, 'EUR');

			// Act
			const result = money.toString();

			// Assert
			expect(result).toBe('EUR 0.00');
		});
	});

	describe('errors', () => {
		it('should reject a negative amount', () => {
			// Arrange
			const amount = -1;
			const currency = 'EUR';

			// Act
			const act = () => Money.create(amount, currency);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an amount exceeding 18 digits', () => {
			// Arrange
			// biome-ignore lint/correctness/noPrecisionLoss: Expected precision loss
			const amount = 1234567890123456789;
			const currency = 'EUR';

			// Act
			const act = () => Money.create(amount, currency);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid currency code (too short)', () => {
			// Arrange
			const amount = 100;
			const currency = 'EU';

			// Act
			const act = () => Money.create(amount, currency);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid currency code (digits)', () => {
			// Arrange
			const amount = 100;
			const currency = '123';

			// Act
			const act = () => Money.create(amount, currency);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject an invalid currency code (too long)', () => {
			// Arrange
			const amount = 100;
			const currency = 'EURO';

			// Act
			const act = () => Money.create(amount, currency);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should throw when adding different currencies', () => {
			// Arrange
			const eur = Money.create(100, 'EUR');
			const usd = Money.create(50, 'USD');

			// Act
			const act = () => eur.add(usd);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should throw when subtracting would result in negative', () => {
			// Arrange
			const a = Money.create(50, 'EUR');
			const b = Money.create(100, 'EUR');

			// Act
			const act = () => a.subtract(b);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should throw when subtracting different currencies', () => {
			// Arrange
			const eur = Money.create(100, 'EUR');
			const usd = Money.create(50, 'USD');

			// Act
			const act = () => eur.subtract(usd);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
