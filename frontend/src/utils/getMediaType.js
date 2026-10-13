export function getYouTubeId(url) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/shorts/")[1];
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }

      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export function getMediaType(url) {
  if (!url) return null;

  if (getYouTubeId(url)) {
    return "youtube";
  }

  const cleanUrl = url
    .split("?")[0]
    .toLowerCase();

  if (
    /\.(jpg|jpeg|png|webp|gif|avif)$/.test(
      cleanUrl
    )
  ) {
    return "image";
  }

  if (
    /\.(mp4|webm|mov|ogg)$/.test(
      cleanUrl
    )
  ) {
    return "video";
  }

  if (
    /\.(mp3|wav|m4a|aac)$/.test(
      cleanUrl
    )
  ) {
    return "audio";
  }

  try {
    new URL(url);
    return "link";
  } catch {
    return null;
  }
}