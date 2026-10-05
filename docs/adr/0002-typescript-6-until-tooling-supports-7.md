# TypeScript stays on 6 until the tooling supports 7

TypeScript 7 (the native compiler) ships without the JavaScript API that typescript-eslint and Next.js's type checking call into, so the repo pins TypeScript 6. Dependabot ignores TypeScript major versions; lift the pin once both tools support 7.
