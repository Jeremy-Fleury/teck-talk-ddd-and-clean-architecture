import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from '@/modules-root/app/infrastructure/strategies/jwt.strategy';

import { GET_OR_CREATE_USER_USE_CASE_PROVIDER } from '@/modules-business/user/infrastructure/dependency-injection/user.provider';
import { UserController } from '@/modules-business/user/presentation/controllers/user.controller';

@Module({
	controllers: [UserController],
	exports: [],
	imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
	providers: [JwtStrategy, GET_OR_CREATE_USER_USE_CASE_PROVIDER],
})
export class UserModule {}
