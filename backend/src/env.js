// Must be the FIRST import in index.js (before any route/db/agent imports).
// ES modules evaluate imports depth-first in declaration order — this file
// has no dependencies of its own that read env vars, so its dotenv.config()
// call completes before any later import's top-level code (DB clients, etc.)
// runs and tries to read process.env.*.
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
