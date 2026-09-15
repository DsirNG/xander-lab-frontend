/**
 * 校验六语言键集完全一致。
 *
 * 与 find-missing-i18n-keys.mjs 互补：那个是「用法驱动」的，只检查 JSX 里出现的
 * t("...") 有没有对应文案；这个是「集合驱动」的，直接比对各语言扁平化后的键路径集合。
 * 少了后者的那一路，一个只在某个语言里漏掉的键（例如某次改动只加了 zh）在代码里
 * 由模板字符串拼出来时是查不出来的。
 *
 * 用法：node scripts/verify-i18n-key-parity.mjs
 * 退出码非 0 表示存在差异。
 */
const langs = ["zh", "en", "fr", "ja", "ru", "vi"];

const flatten = (value, prefix = "", out = []) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        for (const [key, item] of Object.entries(value)) {
            flatten(item, prefix ? `${prefix}.${key}` : key, out);
        }
    } else {
        out.push(prefix);
    }
    return out;
};

const sets = {};
for (const lang of langs) {
    const mod = await import(`../src/locales/${lang}.js`);
    sets[lang] = new Set(flatten(mod.default));
}

const base = sets.zh;
let bad = false;
for (const lang of langs) {
    const missing = [...base].filter((key) => !sets[lang].has(key));
    const extra = [...sets[lang]].filter((key) => !base.has(key));
    console.log(
        `${lang}: total=${sets[lang].size} missing=${missing.length} extra=${extra.length}`,
    );
    if (missing.length) console.log(`  missing sample: ${missing.slice(0, 5)}`);
    if (extra.length) console.log(`  extra sample: ${extra.slice(0, 5)}`);
    if (missing.length || extra.length) bad = true;
}

const mcp = [...base].filter((key) => key.startsWith("blog.agentMcp."));
console.log(`\nblog.agentMcp keys: ${mcp.length}`);
console.log(`workspace.menu.mcpServers present in all: ${langs.every((l) => sets[l].has("workspace.menu.mcpServers"))}`);
console.log(`admin.mcpServers.title present in all: ${langs.every((l) => sets[l].has("admin.mcpServers.title"))}`);
process.exit(bad ? 1 : 0);
