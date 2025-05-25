/**
 * 特殊字符映射表
 */
export const SAFE_CHAR_MAP: Record<string, string> = {
	"[": "-bracket-start-",
	"]": "-bracket-end-",
	"(": "-paren-start-",
	")": "-paren-end-",
	"{": "-brace-start-",
	"}": "-brace-end-",
	$: "-dollar-",
	"#": "-hash-",
	"!": "-important-",
	"/": "-slash-",
	":": "-colon-",
};
