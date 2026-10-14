import React from "react";
import extractContent from "../../utils/url-text-separator.js";
import { getMediaType } from "../../../../frontend/src/utils/getMediaType.js";

import { youtubeTransctipt } from "./youtubeExtractor.js";
// import audioExtractor from "./audioExtractor.js";
// import imageExtractor from "./imageExtractor.js";
import { scrapeLink } from "./linkExtractor.js";

async function orchestrator(note) {
  async function cleaner() {
    const title = note.title ?? "";
    let content = note.content ?? "";
    const tags = note.tags;

    let textData = "";
    let links = [];

    if (content !== "") {
      const data = extractContent(content);
    //   console.log(data);
      //   const data = await JSON.parse(jsonData);
      textData = data.text;
      links = data.links;
    }

    const dataFromUser = [title, content, tags.join(", ")].filter(Boolean);

    let dataFromMedia = "";

    if (links !== null) {
      for (const rawLink of links) {
        try {
          const link = rawLink.trim();

          const normalizedLink = /^www\./i.test(link)
            ? `https://${link}`
            : link;

          let mediaType = getMediaType(normalizedLink);

          switch (mediaType) {
            case "youtube":
              dataFromMedia = await youtubeTransctipt(normalizedLink);
              break;

            // case "video":
            //   dataFromMedia = await videoExtractor(normalizedLink);
            //   break;

            // case "audio":
            //   dataFromMedia = await audioExtractor(normalizedLink);
            //   break;

            // case "image":
            //   dataFromMedia = await imageExtractor(normalizedLink);
            //   break;

            case "link":
              dataFromMedia = await scrapeLink(normalizedLink);
              console.log("Link detected, Sent to service", dataFromMedia);
              break;

            default:
              console.warn(`Unsupported media type: ${link}`);
              continue;
          }

          if (dataFromMedia) {
            dataFromUser.push(dataFromMedia);
          }
        } catch (error) {
          console.error(`Extraction failed for ${normalizedLink}:`, error);
        }
      }
    }
    console.log(
      "Data extraction successful, returning to noteProcessor from orchestrator",
    );
    return dataFromUser;
  }
  return cleaner();
}

export default orchestrator;
