import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import axios from "axios";

const ROOT = process.cwd();
const HOST = process.env.INDEXNOW_HOST || "dinqor.cn";
const KEY_FILE =
    process.env.INDEXNOW_KEY_FILE || "e37f04dea21c4c038138db8ada5e62bc.txt";
const SITEMAP =
    process.env.INDEXNOW_SITEMAP || path.join(ROOT, "dist", "sitemap.xml");
const KEY_PATH = path.isAbsolute(KEY_FILE)
    ? KEY_FILE
    : path.join(ROOT, "public", KEY_FILE);
const ENDPOINT =
    process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10_000;

async function readUrls() {
    const xml = await fs.readFile(SITEMAP, "utf8");
    return [
        ...new Set(
            [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)].map((m) => m[1]),
        ),
    ].filter((url) => url.startsWith(`https://${HOST}/`));
}

async function main() {
    const dryRun = process.argv.includes("--dry-run");
    const [key, urls] = await Promise.all([
        fs.readFile(KEY_PATH, "utf8").then((value) => value.trim()),
        readUrls(),
    ]);
    if (!key || !urls.length)
        throw new Error("IndexNow key 或 sitemap URL 为空");
    console.log(
        `IndexNow: ${urls.length} 个 URL，${dryRun ? "dry-run" : "准备提交"}`,
    );
    if (dryRun) return;

    for (let offset = 0; offset < urls.length; offset += BATCH_SIZE) {
        const urlList = urls.slice(offset, offset + BATCH_SIZE);
        const response = await axios.post(
            ENDPOINT,
            {
                host: HOST,
                key,
                keyLocation: `https://${HOST}/${path.basename(KEY_PATH)}`,
                urlList,
            },
            {
                timeout: 15_000,
                headers: { "Content-Type": "application/json; charset=utf-8" },
            },
        );
        console.log(
            `已提交 ${offset + urlList.length}/${urls.length}，HTTP ${response.status}`,
        );
    }
}

main().catch((error) => {
    const status = error.response?.status;
    console.error(
        `IndexNow 提交失败${status ? ` (HTTP ${status})` : ""}: ${error.message}`,
    );
    process.exitCode = 1;
});
