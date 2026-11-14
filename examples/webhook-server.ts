import { createServer } from 'node:http';
import { Ferrazio, WebhookVerificationError } from '../src/index.js';

const fz = new Ferrazio();
// One verifier for the whole process: it caches the keys and follows rotation.
const verifier = fz.webhooks.verifier();
const seen = new Set<string>();

createServer(async (request, response) => {
  // The signature covers the raw bytes: read the body before any JSON parsing.
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const rawBody = Buffer.concat(chunks);

  try {
    const event = await verifier.verify(rawBody, request.headers);
    // Delivery is at-least-once: deduplicate on event id + delivery id.
    const key = `${event.eventId}:${event.deliveryId}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(event.type, event.payload);
    }
    response.writeHead(204).end();
  } catch (error) {
    if (!(error instanceof WebhookVerificationError)) throw error;
    response.writeHead(400).end(error.reason);
  }
}).listen(3000);
