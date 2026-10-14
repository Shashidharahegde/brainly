
import { fetchTranscript } from "youtube-transcript";

function getYoutubeVideoId(input) {
  if (typeof input !== "string" || !input.trim()) {
    throw new Error("A YouTube URL or video ID is required");
  }

  const value = input.trim();

  // Accept a raw YouTube video ID as well.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(value)
        ? value
        : `https://${value}`
    );

    const hostname = url.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    let videoId = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0];
    } else if (
      [
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
        "youtube-nocookie.com",
      ].includes(hostname)
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        videoId = url.pathname.match(
          /^\/(?:shorts|embed|live|v)\/([^/]+)/
        )?.[1];
      }
    }

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      throw new Error("Invalid YouTube URL or video ID");
    }

    return videoId;
  } catch (error) {
    throw new Error(
      `Could not extract YouTube video ID: ${error.message}`
    );
  }
}

async function getPreferredTranscript(videoId) {
  try {
    // First, try English captions.
    return await fetchTranscript(videoId, { lang: "en" });
  } catch (error) {
    // Only fall back when English captions are unavailable.
    const availableLanguages = error.message.match(
      /Available languages:\s*(.+)$/i
    )?.[1];

    if (!availableLanguages) {
      throw error;
    }

    // Check for English variants such as en-US or en-GB.
    const englishLanguage = availableLanguages
      .split(",")
      .map((language) => language.trim())
      .find((language) => /^en(?:[-_].+)?$/i.test(language));

    if (englishLanguage) {
      return await fetchTranscript(videoId, {
        lang: englishLanguage,
      });
    }

    // No English captions: use the first available caption track.
    console.log(
      `No English captions for ${videoId}. Using the default caption track.`
    );

    return await fetchTranscript(videoId);
  }
}

export async function youtubeTransctipt(url) {
  let videoId;

  try {
    videoId = getYoutubeVideoId(url);

    const transcript = await getPreferredTranscript(videoId);

    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error("No transcript is available for this video");
    }

    // Convert transcript segments into one string for RAG.
    const text = transcript
      .map((segment) =>
        typeof segment?.text === "string"
          ? segment.text.trim()
          : ""
      )
      .filter(Boolean)
      .join(" ");

    if (!text) {
      throw new Error("The transcript contains no usable text");
    }

    console.log(`YouTube transcript extracted: ${videoId}`);

    return text;
  } catch (error) {
    console.error(
      `YouTube transcript extraction failed for ${videoId ?? url}:`,
      error.message
    );

    throw error;
  }
}