export function loadConfig() {
    return {
        port: Number(process.env.PORT ?? 4000),
        host: process.env.HOST ?? "0.0.0.0",
        enableGraphQL: process.env.ENABLE_GRAPHQL !== "false",
    };
}
export const environment = loadConfig();
