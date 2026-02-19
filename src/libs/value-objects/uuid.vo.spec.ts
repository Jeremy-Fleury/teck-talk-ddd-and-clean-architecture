import { ValidationDomainError } from '@/libs/errors/domain.error';
import { Uuid } from '@/libs/value-objects/uuid.vo';

describe('Uuid', () => {
	describe('happy path', () => {
		it('should create a Uuid from a valid v7 string', () => {
			// Arrange
			const value = '019c76d5-4f84-756b-a4f0-fab972c0eb92';

			// Act
			const uuid = Uuid.create(value);

			// Assert
			expect(uuid.toString()).toBe(value);
		});

		it('should generate a valid v7 Uuid', () => {
			// Act
			const uuid = Uuid.generate();

			// Assert
			expect(uuid.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		});

		it('should generate unique Uuids', () => {
			// Act
			const uuid1 = Uuid.generate();
			const uuid2 = Uuid.generate();

			// Assert
			expect(uuid1.toString()).not.toBe(uuid2.toString());
		});

		it('should return true for identical Uuids', () => {
			// Arrange
			const value = '019c76d5-4f84-756b-a4f0-fab972c0eb92';
			const uuid1 = Uuid.create(value);
			const uuid2 = Uuid.create(value);

			// Act
			const result = uuid1.equals(uuid2);

			// Assert
			expect(result).toBe(true);
		});

		it('should return false for different Uuids', () => {
			// Arrange
			const uuid1 = Uuid.generate();
			const uuid2 = Uuid.generate();

			// Act
			const result = uuid1.equals(uuid2);

			// Assert
			expect(result).toBe(false);
		});

		it('should return the raw string value', () => {
			// Arrange
			const value = '019c76d5-4f84-756b-a4f0-fab972c0eb92';
			const uuid = Uuid.create(value);

			// Act
			const result = uuid.toString();

			// Assert
			expect(result).toBe(value);
		});
	});

	describe('errors', () => {
		it('should reject an empty string', () => {
			// Arrange
			const value = '';

			// Act
			const act = () => Uuid.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a random string', () => {
			// Arrange
			const value = 'not-a-uuid';

			// Act
			const act = () => Uuid.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a v4 UUID', () => {
			// Arrange
			const value = '550e8400-e29b-41d4-a716-446655440000';

			// Act
			const act = () => Uuid.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});

		it('should reject a malformed UUID', () => {
			// Arrange
			const value = '550e8400-e29b-7XXX-a716-446655440000';

			// Act
			const act = () => Uuid.create(value);

			// Assert
			expect(act).toThrow(ValidationDomainError);
		});
	});
});
