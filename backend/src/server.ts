import Fastify from "fastify";
import mercurius from "mercurius";

import { environment } from "./config/environment";
import { EventBus } from "./infrastructure/eventing/event-bus";
import { WorkflowEngine } from "./infrastructure/eventing/workflow-engine";
import { MemoryDatabase } from "./infrastructure/persistence/memory-database";
import { LotService } from "./modules/lots/lots.service";
import lotsRoutes from "./modules/lots/lots.routes";

async function buildServer() {
  const fastify = Fastify({
    logger: true,
  });

  const db = new MemoryDatabase();
  const eventBus = new EventBus();
  const workflow = new WorkflowEngine(eventBus);
  const lotService = new LotService(db, eventBus, workflow);

  fastify.register(lotsRoutes, { prefix: "/lots", service: lotService });

  if (environment.enableGraphQL) {
    const schema = /* GraphQL */ `
      type Token {
        tokenId: String!
        symbol: String!
        supply: Int!
        issuedAt: String
      }

      type WasteLot {
        id: String!
        producerId: String!
        materialType: String!
        quantityTons: Float!
        location: String!
        priceFloorUsdPerTon: Float!
        status: String!
        verification: Verification
        token: Token
      }

      type Verification {
        method: String!
        verifier: String!
        notes: String
        verifiedAt: String
      }

      type Query {
        status: String!
        lots: [WasteLot!]!
        lot(id: String!): WasteLot
      }

      type Mutation {
        registerLot(
          producerId: String!
          materialType: String!
          quantityTons: Float!
          location: String!
          priceFloorUsdPerTon: Float!
          notes: String
        ): WasteLot!

        submitVerification(lotId: String!, method: String!, verifier: String, notes: String): WasteLot!

        tokenizeLot(lotId: String!, symbol: String!, supply: Int!): WasteLot!
      }
    `;

    fastify.register(mercurius, {
      schema,
      resolvers: {
        Query: {
          status: () => "ok",
          lots: () => lotService.listLots(),
          lot: (_: unknown, { id }: { id: string }) => lotService.getLot(id),
        },
        Mutation: {
          registerLot: (_: unknown, args: Record<string, unknown>) => lotService.registerLot(args),
          submitVerification: (
            _: unknown,
            args: { lotId: string; method: string; verifier?: string; notes?: string },
          ) =>
            lotService.submitVerification(args.lotId, {
              method: args.method,
              verifier: args.verifier,
              notes: args.notes,
            }),
          tokenizeLot: (_: unknown, args: { lotId: string; symbol: string; supply: number }) =>
            lotService.tokenizeLot(args.lotId, {
              symbol: args.symbol,
              supply: args.supply,
            }),
        },
      },
      graphiql: true,
    });
  }

  return fastify;
}

export async function start() {
  const server = await buildServer();
  const { port, host } = environment;
  try {
    await server.listen({ port, host });
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
