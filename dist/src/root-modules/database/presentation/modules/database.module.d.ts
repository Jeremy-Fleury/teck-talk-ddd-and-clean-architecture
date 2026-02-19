import type { DynamicModule } from "@nestjs/common";
export declare class DatabaseModule {
	private static _isRegistered;
	static forRoot(): DynamicModule;
}
