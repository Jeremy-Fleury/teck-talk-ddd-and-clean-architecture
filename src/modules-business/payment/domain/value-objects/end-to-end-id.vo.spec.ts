import { EndToEndId } from '@/modules-business/payment/domain/value-objects/end-to-end-id.vo';

import { ValidationDomainError } from '@/libs/errors/domain.error';

describe('EndToEndId', () => {
	describe('happy path', () => {
		it('should create a valid EndToEndId', () => {
			// Arrange
			const value = 'ABC123';

			// Act
			const id = EndToEndId.create(value);

			// Assert
			expect(id.toString()).toBe('ABC123');
		});

		it('should trim whitespace', () => {
			// Arrange
			const value = '  ABC123  ';

			// Act
			const id = EndToEndId.create(value);

			// Assert
			expect(id.toString()).toBe('ABC123');
		});

		it('should accept a 35-character ID (max length)', () => {
			// Arrange
			const value = 'A'.repeat(35);

			// Act
			const id = EndToEndId.create(value);

			// Assert
			expect(id.toString()).toBe(value);
		});

		it('should create an EndToEndId with value "NOTPROVIDED"', () => {
			// Act
			const id = EndToEndId.notProvided();

			// Assert
			expect(id.toString()).toBe('NOTPROVIDED');
		});

		it('should return true for isProvided on a regular ID', () => {
			// Arrange
			const id = EndToEndId.create('ABC123');

			// Act
			const result = id.isProvided;

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for isProvided on notProvided', () => {
			// Arrange
			const id = EndToEndId.notProvided();

			// Act
			const result = id.isProvided;

			// Assert
			expect(result).toBe(false);
		});

		it('should return true for identical IDs', () => {
			// Arrange
			const id1 = EndToEndId.create('ABC123');
			const id2 = EndToEndId.create('ABC123');

			// Act
			const result = id1.equals(id2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for different IDs', () => {
			// Arrange
			const id1 = EndToEndId.create('ABC123');
			const id2 = EndToEndId.create('XYZ789');

			// Act
			const result = id1.equals(id2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return true for two notProvided instances', () => {
			// Arrange
			const id1 = EndToEndId.notProvided();
			const id2 = EndToEndId.notProvided();

			// Act
			const result = id1.equals(id2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return the raw string value', () => {
			// Arrange
			const id = EndToEndId.create('MY-REF-001');

			// Act
			const result = id.toString();

			// Assert
			expect(result).toBe('MY-REF-001');
		});
	});

	describe('errors', () => {
		it('should reject an empty string', () => {
			// Arrange
			const value = '';

			// Act
			const act = () => EndToEndId.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject whitespace-only string', () => {
			// Arrange
			const value = '   ';

			// Act
			const act = () => EndToEndId.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a string exceeding 35 characters', () => {
			// Arrange
			const value = 'A'.repeat(36);

			// Act
			const act = () => EndToEndId.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
