import type { Plugin } from "vite";
import { SAFE_CHAR_MAP } from "./config";
import { createCtx } from "../ctx";
import { readFile, rootDir } from "../utils";
import { createEps } from "../eps";

export async function codePlugin(): Promise<Plugin[]> {
	const ctx = await createCtx();
	const eps = await createEps();
	const theme = await readFile(rootDir("theme.json"), true);

	return [
		{
			name: "vite-cool-uniappx-code-pre",
			enforce: "pre",
			async transform(code, id) {
				if (id.includes("/cool/virtual.ts")) {
					ctx["SAFE_CHAR_MAP"] = [];
					for (const i in SAFE_CHAR_MAP) {
						ctx["SAFE_CHAR_MAP"].push([i, SAFE_CHAR_MAP[i]]);
					}

					ctx["theme"] = theme;

					code = code.replace(
						"const ctx = {}",
						`const ctx = ${JSON.stringify(ctx, null, 4)}`,
					);

					code = code.replace(
						"const eps = {}",
						`const eps = ${JSON.stringify(eps, null, 4).replaceAll("[]", "[] as any[]")}`,
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

						if (k != i) {
							d[k] = d[i];
							delete d[i];
						}
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
