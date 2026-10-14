import { Firecrawl } from "firecrawl";
import "dotenv/config";

const API_KEY = process.env.VITE_FIRECRAWL_API_KEY;

export async function scrapeLink(url) {
  try {
    const firecrawl = new Firecrawl({ apiKey: API_KEY });

    // Scrape a website
    const response = await firecrawl.scrape(url, {
      formats: ["markdown"],
    });

    const markdown = response.markdown?.trim() ?? "";
    const title = response.metadata?.title ?? "";
    const sourceURL =
      response.metadata?.sourceURL ?? response.metadata?.url ?? url;
    return [
      title,
      sourceURL,
      markdown,
    ];
  } catch (error) {
    console.log("error while scrapping", url, error);
    throw error;
  }
}
