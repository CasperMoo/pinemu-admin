interface PostcssRemToRpxOptions {
    remUnit?: number;
    remPrecision?: number;
    rpxRatio?: number;
}
interface TailwindTransformOptions extends PostcssRemToRpxOptions {
}
/**
 * uniappX 入口，自动注入 Tailwind 类名转换插件
 * @param options 配置项
 * @returns Vite 插件数组
 */
export declare function uniappX(options?: {
    tailwind?: TailwindTransformOptions;
}): {
    name: string;
    enforce: "pre";
    config(): {
        css: {
            postcss: {
                plugins: {
                    postcssPlugin: string;
                    prepare(): {
                        Rule(rule: any): void;
                        Declaration(decl: any): void;
                    };
                }[];
            };
        };
    };
    transform(code: string, id: string): {
        code: string;
        map: {
            mappings: string;
        };
    } | null;
}[];
export {};
