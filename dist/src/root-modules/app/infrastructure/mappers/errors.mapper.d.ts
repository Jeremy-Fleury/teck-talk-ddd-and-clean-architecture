import { HttpStatus } from "@nestjs/common";
type ErrorConstructor = abstract new (message: string, payload?: Record<string, unknown>) => Error;
export declare const errorHttpStatusByError: Map<ErrorConstructor, HttpStatus>;
