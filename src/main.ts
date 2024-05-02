import { createServer } from 'http'
import { createYoga, useLogger } from 'graphql-yoga'
import pino from "pino";

import { createContext } from "./context"
import { schema } from './schema'

const SERVER_PORT = 4000;
const logger = pino();

function main() {
  const yoga = createYoga({
    schema,
    context: createContext,
    logging: "info",
    plugins: [
      useLogger({
        logFn: (eventName, args) => {
          //console.log(args);
          // Event could be execute-start / execute-end / subscribe-start / subscribe-end / etc.
          // args will include the arguments passed to execute/subscribe (in case of "start" event) and additional result in case of "end" event.
          logger.info(eventName)
        }
      })
    ]
  })
  const server = createServer(yoga)
  server.listen(SERVER_PORT, () => {
    console.info(`Server is running on http://localhost:${SERVER_PORT}/graphql`)
  })
}

main()