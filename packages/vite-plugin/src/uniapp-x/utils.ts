/**
 * 获取动态类名
 */
export const getDynamicClassNames = (value: string): string[] => {
	const names = new Set<string>();

	// 匹配数组中的字符串元素（如 'text-center'）
	const arrayRegex = /['"](.*?)['"]/g;
	let arrayMatch;
	while ((arrayMatch = arrayRegex.exec(value)) !== null) {
		arrayMatch[1].trim() && names.add(arrayMatch[1]);
	}

	// 匹配对象键（如 { 'text-a': 1 }）
	const objKeyRegex = /[{,]\s*['"](.*?)['"]\s*:/g;
	let objKeyMatch;
	while ((objKeyMatch = objKeyRegex.exec(value)) !== null) {
		objKeyMatch[1].trim() && names.add(objKeyMatch[1]);
	}

	// 匹配三元表达式中的字符串（如 'dark' 和 'light'）
	const ternaryRegex = /(\?|:)\s*['"](.*?)['"]/g;
	let ternaryMatch;
	while ((ternaryMatch = ternaryRegex.exec(value)) !== null) {
		ternaryMatch[2].trim() && names.add(ternaryMatch[2]);
	}

	return Array.from(names);
};

/**
 * 获取类名
 */
export function getClassNames(html: string): string[] {
	const classRegex = /(?:class|:class)\s*=\s*(["'])([\s\S]*?)\1/gi;
	const classNames = new Set<string>();
	let match;

	while ((match = classRegex.exec(html)) !== null) {
		const isStaticClass = match[0].startsWith("class");
		const value = match[2].trim();

		if (isStaticClass) {
			// 处理静态 class
			value.split(/\s+/).forEach((name) => name && classNames.add(name));
		} else {
			// 处理动态 :class
			getDynamicClassNames(value).forEach((name) => classNames.add(name));
		}
	}

	return Array.from(classNames);
}

/**
 * 获取 class 内容
 */
export function getClassContent(html: string) {
	const regex = /(?:class|:class)\s*=\s*(['"])([\s\S]*?)\1/g;
	const texts: string[] = [];

	let match;
	while ((match = regex.exec(html)) !== null) {
		texts.push(match[2]);
	}

	return texts;
}

/**
 * 获取节点
 */
export function getNodes(code: string) {
	const nodes: string[] = [];
	const templateMatch = /<template>([\s\S]*?)<\/template>/g.exec(code);

	if (!templateMatch) {
		return nodes;
	}

	const templateContent = templateMatch[1];
	const regex = /<([^>]+)>/g;
	let match;

	while ((match = regex.exec(templateContent)) !== null) {
		if (!match[1].startsWith("/")) {
			nodes.push(match[1]);
		}
	}

	return nodes.map((e) => `<${e}>`);
}

/**
 * 添加 script 标签内容
 */
export function addScriptContent(code: string, content: string) {
	const scriptMatch = /<script\b[^>]*>([\s\S]*?)<\/script>/g.exec(code);

	if (!scriptMatch) {
		return code;
	}

	const scriptContent = scriptMatch[1];
	const scriptStartIndex = scriptMatch.index + scriptMatch[0].indexOf(">") + 1;
	const scriptEndIndex = scriptStartIndex + scriptContent.length;

	return (
		code.substring(0, scriptStartIndex) +
		"\n" +
		content +
		"\n" +
		scriptContent.trim() +
		code.substring(scriptEndIndex)
	);
}

/**
 * 判断是否为 Tailwind 类名
 */
export function isTailwindClass(className: string): boolean {
	const prefixes = [
		// 布局
		"container",
		"flex",
		"grid",
		"block",
		"inline",
		"hidden",
		"visible",

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
		"space-",
		"gap-",

		// 尺寸
		"w-",
		"h-",
		"min-w-",
		"max-w-",
		"min-h-",
		"max-h-",

		// 颜色
		"bg-",
		"text-",
		"border-",
		"ring-",
		"shadow-",

		// 边框
		"border",
		"rounded",
		"ring",

		// 字体
		"font-",
		"text-",
		"leading-",
		"tracking-",
		"antialiased",

		// 定位
		"absolute",
		"relative",
		"fixed",
		"sticky",
		"static",
		"top-",
		"right-",
		"bottom-",
		"left-",
		"inset-",
		"z-",

		// 变换
		"transform",
		"translate-",
		"rotate-",
		"scale-",
		"skew-",

		// 过渡
		"transition",
		"duration-",
		"ease-",
		"delay-",

		// 交互
		"cursor-",
		"select-",
		"pointer-events-",

		// 溢出
		"overflow-",
		"truncate",

		// 滚动
		"scroll-",

		// 伪类和响应式
		"hover:",
		"focus:",
		"active:",
		"disabled:",
		"group-hover:",
	];

	const statePrefixes = ["dark:", "light:", "sm:", "md:", "lg:", "xl:", "2xl:"];

	for (const prefix of prefixes) {
		if (className.startsWith(prefix)) {
			return true;
		}

		for (const statePrefix of statePrefixes) {
			if (className.startsWith(statePrefix + prefix)) {
				return true;
			}
		}
	}

	return false;
}

/**
 * 将 interface 转换为 type
 */
export function interfaceToType(code: string) {
	// 匹配 interface 定义
	const interfaceRegex = /interface\s+(\w+)(\s*extends\s+\w+)?\s*\{([^}]*)\}/g;

	// 将 interface 转换为 type
	return code.replace(interfaceRegex, (match, name, extends_, content) => {
		// 处理可能存在的 extends
		const extendsStr = extends_ ? extends_ : "";

		// 返回转换后的 type 定义
		return `type ${name}${extendsStr} = {${content}}`;
	});
}
