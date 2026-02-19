import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
declare const JwtGuardBase: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtGuard extends JwtGuardBase {
	private readonly _reflector;
	constructor(_reflector: Reflector);
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
	handleRequest<TUser>(err: unknown, user: TUser): TUser;
}
