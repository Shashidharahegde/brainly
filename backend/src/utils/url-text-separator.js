const URL_REGEX = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;

export default function extractContent(str, lower = false) {
  if (typeof str !== "string") {
    throw new TypeError(`Expected a string, got ${typeof str}`);
  }

  const links = [];

  const text = str.replace(URL_REGEX, (match) => {
    let url = match;

    // Remove trailing punctuation, but preserve
    // balanced parentheses inside URLs.
    const brackets = { ")": "(", "]": "[", "}": "{" };

    while (/[.,!?;:)\]}]$/.test(url)) {
      const last = url.at(-1);
      const opening = brackets[last];

      if (opening && url.split(last).length <= url.split(opening).length) {
        break;
      }

      url = url.slice(0, -1);
    }

    // Ignore invalid URLs.
    try {
    //If it starts with www., temporarily prepend http:// just for the native URL validation
      const validationUrl = url.toLowerCase().startsWith("www.")
        ? `http://${url}`
        : url;
      if (!new URL(validationUrl).hostname) return match;
    } catch {
      return match;
    }

    links.push(lower ? url.toLowerCase() : url);

    // Keep punctuation that follows the URL.
    return match.slice(url.length);
  });

  return {
    text: text
      .replace(/\s+([.,!?;:])/g, "$1")
      .replace(/\s+/g, " ")
      .trim(),
    links,
  };
}
