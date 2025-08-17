import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { crawlingAndClone } from "./crawling.js";
import { startServer } from "../index.js";

const argv = yargs(hideBin(process.argv))
  .scriptName("siteclone") .usage("$0 <url> [options]")
  .positional("url", { describe: "Website URL to clone", type: "string" }).option("out", {
    alias: "o",
    describe: "Output directory",
    type: "string",
    default: "dist/site",
  }).option("max-pages", {
    describe: "Max number of pages to crawl",
    type: "number",
    default: 100,
  }).option("same-origin", {
    describe: "Only download same-origin assets",
    type: "boolean",
    default: true,
  }).option("concurrency", {
    describe: "Download concurrency",
    type: "number",
    default: 10,
  }).option("timeout", {
    describe: "HTTP timeout (ms)",
    type: "number",
    default: 20000,
  }).option("respect-robots", {
    describe: "Respect robots.txt (best effort)",
    type: "boolean",
    default: true,
  }).option("serve", {
    describe: "Start a local HTTP server on port",
    type: "number",
  })
  .option("open", {
    describe: "Open default browser after serving",
    type: "boolean",
    default: false,
  })
  .example(
    "$0 https://code.visualstudio.com --out dist/vscode --max-pages 40 --serve 4000 --open",
    "Clone VS Code site and serve locally"
  )
  .demandCommand(1, "Error: Website URL is required")
  .help().argv;


  const url = argv._[0];
const outDir = path.resolve(argv.out);

function validateUrl(url) {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error("Error: URL must start with http:// or https://");
    process.exit(1);
  }
}

async function main() {
  validateUrl(url);

  console.log(`ℹ️ Starting crawl of: ${url}`);
  console.log(`📂 Output directory: ${outDir}`);

  await crawlingAndClone({
    startUrl: url,
    outDir,
    maxPages: argv["max-pages"],
    sameOriginOnly: argv["same-origin"],
    concurrency: argv.concurrency,
    timeout: argv.timeout,
    respectRobots: argv["respect-robots"],
  });

  console.log("✅ Crawl completed successfully.");

  if (argv.serve) {
    const port = argv.serve;
    console.log(`🚀 Serving at http://localhost:${port}`);
    await startServer({ root: outDir, port, openBrowser: argv.open });
  }
}

main().catch((err) => {
  console.error("💥 Fatal error:", err.message || err);
  process.exit(1);
});
