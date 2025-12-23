import fastifyPlugin from "fastify-plugin";
export default fastifyPlugin(async function lotsRoutes(fastify, opts) {
    const { service } = opts;
    fastify.get("/", async () => service.listLots());
    fastify.get("/:id", async (request, reply) => {
        const lot = service.getLot(request.params.id);
        if (!lot) {
            reply.code(404);
            return { message: "Lot not found" };
        }
        return lot;
    });
    fastify.post("/", async (request) => service.registerLot(request.body));
    fastify.post("/:id/verification", async (request, reply) => {
        try {
            return service.submitVerification(request.params.id, request.body);
        }
        catch (error) {
            reply.code(404);
            return { message: error.message };
        }
    });
    fastify.post("/:id/tokenize", async (request, reply) => {
        try {
            return service.tokenizeLot(request.params.id, request.body);
        }
        catch (error) {
            reply.code(404);
            return { message: error.message };
        }
    });
});
