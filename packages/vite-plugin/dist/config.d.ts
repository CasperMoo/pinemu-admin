export declare const config: {
    type: string;
    reqUrl: string;
    demo: boolean;
    nameTag: boolean;
    eps: {
        enable: boolean;
        api: string;
        dist: string;
        mapping: ({
            custom: ({ propertyName, type }: {
                propertyName: string;
                type: string;
            }) => null;
            type?: undefined;
            test?: undefined;
        } | {
            type: string;
            test: string[];
            custom?: undefined;
        })[];
    };
    svg: {
        skipNames: string[];
    };
    tailwind: {
        enable: boolean;
        remUnit: number;
        remPrecision: number;
        rpxRatio: number;
        darkTextClass: string;
    };
};
