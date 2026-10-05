import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const read = async (name: string) => {
  try {
    return JSON.parse(await readFile(new URL(`../.data/${name}`, import.meta.url), "utf8")) as Record<string, any>;
  } catch {
    return {};
  }
};

const profiles = await read("profiles.json");
for (const [id, e] of Object.entries(profiles)) {
  await db.profile.upsert({
    where: { id },
    create: { id, tokenHash: e.tokenHash, data: e.data, updatedAt: new Date(e.updatedAt) },
    update: {},
  });
}

const trips = await read("trips.json");
for (const [id, e] of Object.entries(trips)) {
  await db.sharedTrip.upsert({ where: { id }, create: { id, data: e.trip, createdAt: new Date(e.createdAt) }, update: {} });
}

console.log(`Imported ${Object.keys(profiles).length} profiles and ${Object.keys(trips).length} trips.`);
await db.$disconnect();
