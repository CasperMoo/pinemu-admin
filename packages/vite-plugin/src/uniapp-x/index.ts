// @ts-ignore
import valueParser from "postcss-value-parser";
import { config } from "../config";
import type { Plugin } from "vite";
import { Config } from "../../types";

/**
 * Tailwind CSS 特殊字符映射表
 * 用于将类名中的特殊字符转换为安全字符，避免编译或运行时冲突
 */
const TAILWIND_SAFE_CHAR_MAP: Record<string, string> = {
	"[": "-",
	"]": "-",
	"(": "-",
	")": "-",
	"{": "-",
	"}": "-",
	$: "-v-",
	"#": "-h-",
	"!": "-i-",
	"/": "-s-",
	":": "-c-",
	",": "-2c-",
};

/**
 * Tailwind CSS 常用类名前缀集合
 * 按功能分类，便于维护和扩展
 */
const TAILWIND_CLASS_PREFIXES: string[] = [
	// 间距
	"p-",
	"px-",
	"py-",
	"pt-",
	"pr-",
	"pb-",
	"pl-",
	"m-",
	"mx-",
	"my-",
	"mt-",
	"mr-",
	"mb-",
	"ml-",
	"gap-",
	"gap-x-",
	"gap-y-",
	"space-x-",
	"space-y-",
	"inset-",
	"top-",
	"right-",
	"bottom-",
	"left-",

	// 尺寸
	"w-",
	"h-",
	"min-w-",
	"min-h-",
	"max-w-",
	"max-h-",

	// 排版
	"text-",
	"font-",
	"leading-",
	"tracking-",
	"indent-",

	// 边框
	"border-",
	"border-t-",
	"border-r-",
	"border-b-",
	"border-l-",
	"rounded-",
	"rounded-t-",
	"rounded-r-",
	"rounded-b-",
	"rounded-l-",
	"rounded-tl-",
	"rounded-tr-",
	"rounded-br-",
	"rounded-bl-",

	// 效果
	"shadow-",
	"blur-",
	"brightness-",
	"contrast-",
	"drop-shadow-",
	"grayscale-",
	"hue-rotate-",
	"invert-",
	"saturate-",
	"sepia-",
	"backdrop-blur-",
	"backdrop-brightness-",
	"backdrop-contrast-",
	"backdrop-grayscale-",
	"backdrop-hue-rotate-",
	"backdrop-invert-",
	"backdrop-opacity-",
	"backdrop-saturate-",
	"backdrop-sepia-",

	// 动画
	"transition-",
	"duration-",
	"delay-",
	"animate-",

	// 变换
	"translate-x-",
	"translate-y-",
	"rotate-",
	"scale-",
	"scale-x-",
	"scale-y-",
	"skew-x-",
	"skew-y-",
	"origin-",

	// 布局
	"columns-",
	"break-after-",
	"break-before-",
	"break-inside-",

	// Flexbox 和 Grid
	"basis-",
	"grow-",
	"shrink-",
	"grid-cols-",
	"grid-rows-",
	"col-span-",
	"row-span-",
	"col-start-",
	"col-end-",
	"row-start-",
	"row-end-",

	// SVG
	"stroke-",
	"stroke-w-",
	"fill-",
];

/**
 * Tailwind CSS 颜色变量映射
 * 用于移除不需要的 CSS 变量声明
 */
const TAILWIND_COLOR_VARS: Record<string, number> = {
	"--tw-text-opacity": 1,
	"--tw-bg-opacity": 1,
};

/**
 * 转换类名中的特殊字符为安全字符
 * @param value 原始类名或值
 * @param isSelector 是否为选择器（true）或普通值（false）
 * @returns 转换后的安全字符串
 */
function toSafeTailwindClass(value: string, isSelector: boolean = false): string {
	// 处理任意值语法（如 w-[100px]）
	const arbitrary = value.match(/^(.+?)-\[(.*?)\]$/);
	if (arbitrary) {
		if (isSelector) return value;
		const [, prefix, content] = arbitrary;
		const safePrefix = toSafeTailwindClass(prefix, isSelector);
		const safeContent = content.replace(/[^\d.\w]/g, "-");
		return `${safePrefix}-${safeContent}`;
	}

	let safeValue = value;

	// 移除转义字符
	if (safeValue.includes("\\")) {
		safeValue = safeValue.replace(/\\/g, "");
	}

	// 替换特殊字符
	for (const [char, rep] of Object.entries(TAILWIND_SAFE_CHAR_MAP)) {
		const reg = new RegExp("\\" + char, "g");
		if (reg.test(safeValue)) {
			safeValue = safeValue.replace(reg, rep);
		}
	}

	return safeValue;
}

/**
 * 将现代 rgb 格式（如 rgb(234 179 8 / 0.1)）转换为标准 rgba 格式
 * @param value rgb 字符串
 * @returns 标准 rgba 字符串
 */
function rgbToRgba(value: string): string {
	const match = value.match(/rgb\(([\d\s]+)\/\s*([\d.]+)\)/);
	if (match) {
		const [, rgb, alpha] = match;
		const [r, g, b] = rgb.split(/\s+/);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	return value;
}

/**
 * PostCSS 插件：将 rem 单位转换为 rpx，并处理 Tailwind 特殊字符
 * @param options 配置项
 * @returns PostCSS 插件对象
 */
function postcssRemToRpx() {
	return {
		postcssPlugin: "vite-cool-uniappx-remToRpx",
		prepare() {
			const handledSelectors = new Set<string>();
			const { remUnit = 16, remPrecision = 6, rpxRatio = 2 } = config.tailwind;
			const factor = remUnit * rpxRatio;

			return {
				Rule(rule: any) {
					const sel = rule.selector;
					if (handledSelectors.has(sel)) return;
					const safeSel = toSafeTailwindClass(sel, true);
					if (safeSel !== sel) {
						rule.selector = safeSel;
						handledSelectors.add(sel);
					}
				},
				Declaration(decl: any) {
					if (decl.value.includes("/* no-rem */")) return;
					if (TAILWIND_COLOR_VARS[decl.prop]) {
						decl.remove();
						return;
					}
					if (decl.value.includes("rgb(") && decl.value.includes("/")) {
						decl.value = rgbToRgba(decl.value);
					}
					if (decl.value.includes("rpx") && decl.parent.selector.includes("text-")) {
						decl.prop = "font-size";
					}

					const parsed = valueParser(decl.value);
					let changed = false;

					parsed.walk((node: any) => {
						if (node.type === "word") {
							// rem 转 rpx
							const unit = valueParser.unit(node.value);
							if (unit?.unit === "rem") {
								const num = unit.number;
								const precision = (num.split(".")[1] || "").length;
								const rpxVal = (parseFloat(num) * factor)
									.toFixed(precision || remPrecision)
									.replace(/\.?0+$/, "");
								node.value = `${rpxVal}rpx`;
								changed = true;
							}
							// 特殊字符处理
							if (node.value.includes(".") || /[[\]()#!/:,]/.test(node.value)) {
								const safe = toSafeTailwindClass(node.value, true);
								if (safe !== node.value) {
									node.value = safe;
									changed = true;
								}
							}
						}
						// 处理 var(--tw-xxx)
						if (node.type === "function" && node.value === "var") {
							if (node.nodes.length > 0 && node.nodes[0].value.startsWith("--tw-")) {
								node.type = "word";
								node.value = TAILWIND_COLOR_VARS[node.nodes[0].value];
								changed = true;
							}
						}
					});

					if (changed) {
						decl.value = parsed.toString();
					}
				},
			};
		},
	};
}
postcssRemToRpx.postcss = true;

/**
 * Vite 插件：自动转换 .uvue 文件中的 Tailwind 类名为安全字符
 * 并自动注入 rem 转 rpx 的 PostCSS 插件
 */
function tailwindTransformPlugin() {
	return {
		name: "vite-cool-uniappx-tailwind",
		enforce: "pre",

		config() {
			return {
				css: {
					postcss: {
						plugins: [postcssRemToRpx()],
					},
				},
			};
		},

		transform(code, id) {
			if (!id.includes(".uvue")) return null;

			let resultCode = code;
			const tplMatch = resultCode.match(/<template>([\s\S]*?)<\/template>/);
			if (!tplMatch?.[1]) return null;

			let tpl = tplMatch[1];
			const tplOrigin = tpl;

			TAILWIND_CLASS_PREFIXES.forEach((prefix) => {
				for (const [char, rep] of Object.entries(TAILWIND_SAFE_CHAR_MAP)) {
					const reg = new RegExp(`(${prefix}[^\\s'"]*?\\${char}[^\\s'"]*?)`, "g");
					const matches = [...tpl.matchAll(reg)];
					matches.forEach((m) => {
						const raw = m[1];
						const safe = raw.replace(new RegExp("\\" + char, "g"), rep);
						if (process.env.NODE_ENV === "development") {
							console.log(`类名转换: ${raw} → ${safe}`);
						}
						tpl = tpl.replace(raw, safe);
					});
				}
			});

			if (tpl !== tplOrigin) {
				resultCode = resultCode.replace(tplMatch[0], `<template>${tpl}</template>`);
				return {
					code: resultCode,
					map: { mappings: "" },
				};
			}
			return null;
		},
	} as Plugin;
}

/**
 * uniappX 入口，自动注入 Tailwind 类名转换插件
 * @param options 配置项
 * @returns Vite 插件数组
 */
export function uniappX() {
	if (config.type == "uniapp-x") {
		if (config.tailwind.enable) {
			return [tailwindTransformPlugin()];
		}
	}

	return [];
}
