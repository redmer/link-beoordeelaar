import { Container, CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || "link-beoordelaar";
const containerId = process.env.COSMOS_CONTAINER || "subjects";

let containerPromise: Promise<Container> | null = null;

async function createContainer(): Promise<Container> {
  if (!endpoint || !key) {
    throw new Error("Missing COSMOS_ENDPOINT or COSMOS_KEY.");
  }

  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({
    id: databaseId,
  });
  const { container } = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: {
      paths: ["/datasetId"],
    },
  });

  return container;
}

export async function getSubjectsContainer(): Promise<Container> {
  if (!containerPromise) {
    containerPromise = createContainer();
  }

  return containerPromise;
}
