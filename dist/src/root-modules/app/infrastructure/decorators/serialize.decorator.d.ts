export declare const RESPONSE_TYPE_KEY = "response_type";
type ClassType<TParameter = unknown> = new (...args: unknown[]) => TParameter;
export declare const Serialize: <TDto>(
	dto: ClassType<TDto>,
) => <TFunction extends Function, Y>(
	target: TFunction | object,
	propertyKey?: string | symbol,
	descriptor?: TypedPropertyDescriptor<Y>,
) => void;
