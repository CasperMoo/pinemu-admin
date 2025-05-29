import { firstUpperCase } from "../utils";

/**
 * 解析结果的接口定义
 * @interface ParseResult
 */
interface ParseResult {
	/** 解析出的键名 */
	key: string;
	/** 解析出的内容 */
	content: string;
	/** 层级 */
	level: number;
}

/**
 * 将模板字符串扁平化处理，转换为 Service 类型定义
 * @param template - 包含 Service 类型定义的模板字符串
 * @returns 处理后的 Service 类型定义字符串
 * @throws {Error} 当模板中找不到 Service 类型定义时抛出错误
 */
export function flatten(template: string): string {
	// 查找 Service 类型定义的起始位置
	const startIndex = template.indexOf("export type Service = {");

	// 保留 Service 类型定义前的内容
	let header = template.substring(0, startIndex);

	// 获取 Service 类型定义及其内容，去除换行和制表符
	const serviceContent = template.substring(startIndex).replace(/\n|\t/g, "");

	let interfaces = "";
	let serviceFields = "";

	// 解析内容并生成接口定义
	parse(serviceContent).forEach(({ key, content, level }) => {
		interfaces += `\nexport interface ${firstUpperCase(key)}Interface {${content}}\n`;
		serviceFields += `${key}: ${firstUpperCase(key)}Interface;`;
	});

	return `${header}${interfaces}\nexport type Service = {${serviceFields}}`;
}

/**
 * 查找匹配的右花括号位置
 * @param str - 要搜索的字符串
 * @param startIndex - 开始搜索的位置
 * @returns 匹配的右花括号位置
 * @throws {Error} 当找不到匹配的右花括号时抛出错误
 */
function findClosingBrace(str: string, startIndex: number): number {
	let braceCount = 1;
	let currentIndex = startIndex;

	while (currentIndex < str.length && braceCount > 0) {
		if (str[currentIndex] === "{") braceCount++;
		if (str[currentIndex] === "}") braceCount--;
		currentIndex++;
	}

	if (braceCount !== 0) {
		throw new Error("Unmatched braces in the template");
	}

	return currentIndex - 1;
}

/**
 * 解析内容中的嵌套结构
 * @param content - 要解析的内容字符串
 * @returns 解析结果数组，包含解析出的键值对
 */
function parse(content: string, level: number = 0): ParseResult[] {
	// 匹配形如 xxx: { ... } 的结构
	const interfacePattern = /(\w+)\s*:\s*\{/g;
	const result: ParseResult[] = [];
	let match: RegExpExecArray | null;

	while ((match = interfacePattern.exec(content)) !== null) {
		const startIndex = match.index + match[0].length;
		const endIndex = findClosingBrace(content, startIndex);

		if (endIndex > startIndex) {
			let parsedContent = content.substring(startIndex, endIndex).trim();

			// 处理嵌套结构
			if (parsedContent.includes("{") && parsedContent.includes("}")) {
				const nestedInterfaces = parse(parsedContent, level + 1);

				// 替换嵌套的内容为接口引用
				if (nestedInterfaces.length > 0) {
					nestedInterfaces.forEach((nestedInterface) => {
						const pattern = `${nestedInterface.key}: {${nestedInterface.content}};`;
						const replacement = `${nestedInterface.key}: ${firstUpperCase(nestedInterface.key)}Interface`;
						parsedContent = parsedContent.replace(pattern, replacement);
					});
				}
			}

			// 将解析结果添加到数组开头
			result.unshift({
				key: match[1],
				level,
				content: parsedContent,
			});
		}
	}

	return result;
}
