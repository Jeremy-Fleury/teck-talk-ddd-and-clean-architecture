import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserOutputDto {
	@ApiProperty({
		description: 'The user id',
		example: '019ad951-368a-7de5-b7ba-add19cfd187b',
		type: String,
	})
	@Expose()
	id!: string;

	@ApiProperty({
		description: 'The user email',
		example: 'hello@acme.com',
		nullable: true,
		type: String,
	})
	@Expose()
	email!: string | null;

	@ApiProperty({
		description: 'First name for the user',
		example: 'John',
		nullable: true,
		type: String,
	})
	@Expose()
	firstName!: string | null;

	@ApiProperty({
		description: 'Last name for the user',
		example: 'Doe',
		nullable: true,
		type: String,
	})
	@Expose()
	lastName!: string | null;
}
