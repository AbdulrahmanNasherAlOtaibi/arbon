import pino from "pino";

// Pretty-printing spawns a pino-pretty worker thread that is resolved from
// node_modules at runtime. The deployed image ships only the bundled dist/
// with no node_modules, so the transport can never load there. Enable it only
// for explicit local development (the `dev` script sets NODE_ENV=development);
// every other environment — production or an unset NODE_ENV — logs plain JSON
// to stdout, which is safe with no node_modules present.
const usePrettyTransport = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(usePrettyTransport
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
