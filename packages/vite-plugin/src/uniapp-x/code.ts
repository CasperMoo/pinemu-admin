import type { Plugin } from "vite";
import { SAFE_CHAR_MAP } from "./config";
import { createCtx } from "../ctx";
import { readFile, rootDir } from "../utils";

export function codePlugin(): Plugin[] {
	return [
		{
			name: "vite-cool-uniappx-code-pre",
			enforce: "pre",
			async transform(code, id) {
				if (id.includes("/cool/virtual.ts")) {
					const ctx = await createCtx();

					ctx["SAFE_CHAR_MAP"] = [];
					for (const i in SAFE_CHAR_MAP) {
						ctx["SAFE_CHAR_MAP"].push([i, SAFE_CHAR_MAP[i]]);
					}

					const theme = await readFile(rootDir("theme.json"), true);
					ctx["theme"] = theme;

					code = code.replace(
						"export const ctx = {}",
						`export const ctx = ${JSON.stringify(ctx, null, 4)}`,
					);

					return {
						code,
						map: { mappings: "" },
					};
				}

				if (id.endsWith(".json")) {
					const d = JSON.parse(code);

					for (let i in d) {
						let k = i;

						for (let j in SAFE_CHAR_MAP) {
							k = k.replaceAll(j, SAFE_CHAR_MAP[j]);
						}

						d[k] = d[i];
						delete d[i];
					}

					return {
						code: JSON.stringify(d),
						map: { mappings: "" },
					};
				}
			},
		},
		{
			name: "vite-cool-uniappx-code",
			transform(code, id) {
				if (id.endsWith(".json")) {
					return {
						code: code.replace("new UTSJSONObject", ""),
						map: { mappings: "" },
					};
				}
			},
		},
	];
}
