import { cp, mkdir } from "node:fs/promises";

const source = new URL("../pdfs/", import.meta.url);
const destination = new URL("../public/pdfs/", import.meta.url);

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });
