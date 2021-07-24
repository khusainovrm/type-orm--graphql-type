import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import * as Express from "express";
import { buildSchema } from "type-graphql";
import { connectioOption } from "./ormconfig";
import { createConnection } from "typeorm";

const PORT = process.env.BACKEND_PORT || 80;

const main = async () => {
  const orm = await createConnection(connectioOption).catch((error) =>
    console.log(error)
  );
  const schema = await buildSchema({
    resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
  });

  const apolloServer = new ApolloServer({
    schema,
    context: () => ({
      em: orm,
    }),
  });
  const app = Express();
  apolloServer.applyMiddleware({ app });

  app.listen(PORT, () => {
    console.log(`Server is started on http://localhost:${PORT}/graphql`);
  });
};

main().catch(console.log);
