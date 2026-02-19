export declare const ExampleStatus: {
    readonly draft: "draft";
    readonly active: "active";
    readonly archived: "archived";
};
export type ExampleStatus = (typeof ExampleStatus)[keyof typeof ExampleStatus];
export declare const TransactionType: {
    readonly credit: "credit";
    readonly debit: "debit";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
