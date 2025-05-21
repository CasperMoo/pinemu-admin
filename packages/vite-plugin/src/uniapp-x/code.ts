import type { Plugin } from "vite";

export function codePlugin() {
	return {
		name: "vite-cool-uniappx-code",
		transform(code, id) {
			if (id.endsWith(".json")) {
				return code.replace("new UTSJSONObject", "");
			}
		},
	} as Plugin;
}
