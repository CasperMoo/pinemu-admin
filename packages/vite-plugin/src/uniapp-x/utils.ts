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

	// 匹配反引号模板字符串
	const templateRegex = /`([^`]*)`/g;
	let templateMatch;
	while ((templateMatch = templateRegex.exec(value)) !== null) {
		const templateContent = templateMatch[1];

		// 提取模板字符串中的普通文本部分（排除 ${} 表达式）
		const textParts = templateContent.split(/\$\{[^}]*\}/);
		textParts.forEach((part) => {
			part.trim()
				.split(/\s+/)
				.forEach((className) => {
					className.trim() && names.add(className.trim());
				});
		});

		// 提取模板字符串中 ${} 表达式内的字符串
		const expressionRegex = /\$\{([^}]*)\}/g;
		let expressionMatch;
		while ((expressionMatch = expressionRegex.exec(templateContent)) !== null) {
			const expression = expressionMatch[1];
			// 递归处理表达式中的动态类名
			getDynamicClassNames(expression).forEach((name) => names.add(name));
		}
	}

	return Array.from(names);
};

/**
 * 获取类名
 */
export function getClassNames(code: string): string[] {
	const classRegex = /(?:class|:class|:pt)\s*=\s*(['"`])([\s\S]*?)\1/gi;
	const classNames = new Set<string>();
	let match;

	while ((match = classRegex.exec(code)) !== null) {
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
export function getClassContent(code: string) {
	const regex = /(?:class|:class|:pt)\s*=\s*(['"`])([\s\S]*?)\1/g;
	const texts: string[] = [];

	let match;
	while ((match = regex.exec(code)) !== null) {
		texts.push(match[2]);
	}

	return texts;
}

/**
 * 获取节点
 */
export function getNodes(code: string) {
	const nodes: string[] = [];

	// 找到所有顶级template标签的完整内容
	function findTemplateContents(content: string): string[] {
		const results: string[] = [];
		let index = 0;

		while (index < content.length) {
			const templateStart = content.indexOf("<template", index);
			if (templateStart === -1) break;

			// 找到模板标签的结束位置
			const tagEnd = content.indexOf(">", templateStart);
			if (tagEnd === -1) break;

			// 使用栈来匹配配对的template标签
			let stack = 1;
			let currentPos = tagEnd + 1;

			while (currentPos < content.length && stack > 0) {
				const nextTemplateStart = content.indexOf("<template", currentPos);
				const nextTemplateEnd = content.indexOf("</template>", currentPos);

				if (nextTemplateEnd === -1) break;

				// 如果开始标签更近，说明有嵌套
				if (nextTemplateStart !== -1 && nextTemplateStart < nextTemplateEnd) {
					// 找到开始标签的完整结束
					const nestedTagEnd = content.indexOf(">", nextTemplateStart);
					if (nestedTagEnd !== -1) {
						stack++;
						currentPos = nestedTagEnd + 1;
					} else {
						break;
					}
				} else {
					// 找到结束标签
					stack--;
					currentPos = nextTemplateEnd + 11; // '</template>'.length
				}
			}

			if (stack === 0) {
				// 提取template内容（不包括template标签本身）
				const templateContent = content.substring(tagEnd + 1, currentPos - 11);
				results.push(templateContent);
				index = currentPos;
			} else {
				// 如果没有找到匹配的结束标签，跳过这个开始标签
				index = tagEnd + 1;
			}
		}

		return results;
	}

	// 递归提取所有template内容中的节点
	function extractNodesFromContent(content: string): void {
		// 先提取当前内容中的所有标签
		const regex = /<([^>]+)>/g;
		let match;

		while ((match = regex.exec(content)) !== null) {
			if (!match[1].startsWith("/") && !match[1].startsWith("template")) {
				nodes.push(match[1]);
			}
		}

		// 递归处理嵌套的template
		const nestedTemplates = findTemplateContents(content);
		nestedTemplates.forEach((templateContent) => {
			extractNodesFromContent(templateContent);
		});
	}

	// 获取所有顶级template内容
	const templateContents = findTemplateContents(code);

	// 处理每个template内容
	templateContents.forEach((templateContent) => {
		extractNodesFromContent(templateContent);
	});

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

	if (className.includes("!")) {
		return true;
	}

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
