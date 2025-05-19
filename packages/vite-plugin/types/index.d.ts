export declare type Type = "admin" | "app" | "uniapp-x";

export declare namespace Eps {
	interface Column {
		comment: string;
		nullable: boolean;
		propertyName: string;
		source: string;
		type: string;
		dict: string[] | string;
		defaultValue: any;
		[key: string]: any;
	}

	interface Entity {
		api: {
			dts: {
				parameters?: {
					description: string;
					name: string;
					required: boolean;
					schema: {
						type: string;
					};
				}[];
			};
			name: string;
			method: string;
			path: string;
			prefix: string;
			summary: string;
			tag: string;
		}[];
		columns: Column[];
		pageColumns: Column[];
		pageQueryOp: {
			fieldEq: string[];
			fieldLike: string[];
			keyWordLikeFields: string[];
		};
		search: {
			fieldEq: Column[];
			fieldLike: Column[];
			keyWordLikeFields: Column[];
		};
		module: string;
		name: string;
		prefix: string;
		[key: string]: any;
	}
}

export declare namespace Ctx {
	type Pages = {
		path?: string;
		style?: {
			[key: string]: any;
		};
		[key: string]: any;
	}[];

	type SubPackages = {
		root?: string;
		pages?: Ctx.Pages;
		[key: string]: any;
	}[];

	interface Data {
		appid?: string;
		pages?: Ctx.Pages;
		subPackages?: Ctx.SubPackages;
		modules?: string[];
		serviceLang: "Node" | "Java" | "Go" | "Python";
		[key: string]: any;
	}
}

export declare namespace Config {
	interface Eps {
		// 是否开启Eps
		enable: boolean;
		// 请求地址
		api: "app" | "admin" | (string & {});
		// 输出目录
		dist: string;
		// 映射
		mapping: {
			type?: string;
			test?: string[];
			custom?(data: { propertyName: string; type: string }): any;
		}[];
	}
	interface Options {
		// 应用类型
		type: Type;
		// 代理配置
		proxy: any;
		// Eps
		eps?: Partial<Config.Eps>;
		// 是否开启演示模式
		demo?: boolean;
		// 是否开启名称标签
		nameTag?: boolean;
		// svg
		svg?: {
			// 跳过拼接模块名
			skipNames?: string[];
		};
	}
	interface Data {
		type: Type;
		reqUrl: string;
		eps: Config.Eps;
		demo: boolean;
		[key: string]: any;
	}
}
