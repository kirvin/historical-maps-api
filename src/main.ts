import { createServer } from 'http'
import { createYoga } from 'graphql-yoga'
import { createContext } from "./context"
import { schema } from './schema'

const SERVER_PORT = 4000;

function main() {
  const yoga = createYoga({ schema, context: createContext })
  const server = createServer(yoga)
  server.listen(SERVER_PORT, () => {
    console.info(`Server is running on http://localhost:${SERVER_PORT}/graphql`)
  })
}

main()