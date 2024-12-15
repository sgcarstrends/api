import { getLatestMonth } from "@/lib/getLatestMonth";
import { Collection } from "@/types";
import { Hono } from "hono";

const app = new Hono();

app.get("/latest", async (c) => {
	const collection = c.req.query("collection") as Collection;
	const dbCollections: Collection[] = [Collection.Cars, Collection.COE];

	const latestMonthObj: Record<string, string> = {};

	if (collection && dbCollections.includes(collection)) {
		latestMonthObj[collection] = await getLatestMonth(collection);
	} else {
		for (const dbCollection of dbCollections) {
			latestMonthObj[dbCollection] = await getLatestMonth(dbCollection);
		}
	}

	return c.json(latestMonthObj);
});

export default app;
