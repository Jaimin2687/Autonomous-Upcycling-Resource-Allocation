import fastifyPlugin from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { LotService } from "./lots.service";

export interface LotsRoutesOptions {
  service: LotService;
}

export default fastifyPlugin(async function lotsRoutes(fastify: FastifyInstance, opts: LotsRoutesOptions) {
  const { service } = opts;

  fastify.get("/", async () => service.listLots());

  type LotParams = { id: string };

  fastify.get("/:id", async (request: FastifyRequest<{ Params: LotParams }>, reply: FastifyReply) => {
    const lot = service.getLot(request.params.id);
    if (!lot) {
      reply.code(404);
      return { message: "Lot not found" };
    }
    return lot;
  });

  fastify.post("/", async (request: FastifyRequest) => service.registerLot(request.body));

  fastify.post(
    "/:id/verification",
    async (request: FastifyRequest<{ Params: LotParams }>, reply: FastifyReply) => {
      try {
        return service.submitVerification(request.params.id, request.body);
      } catch (error) {
        reply.code(404);
        return { message: (error as Error).message };
      }
    },
  );

  fastify.post(
    "/:id/tokenize",
    async (request: FastifyRequest<{ Params: LotParams }>, reply: FastifyReply) => {
      try {
        return service.tokenizeLot(request.params.id, request.body);
      } catch (error) {
        reply.code(404);
        return { message: (error as Error).message };
      }
    },
  );
});
