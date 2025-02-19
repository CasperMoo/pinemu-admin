import type { Eps } from "../../types";
export declare function createEps(): Promise<{
    service: {};
    list: Eps.Entity[];
    isUpdate: boolean;
} | {
    service: {};
    list: never[];
    isUpdate?: undefined;
}>;
