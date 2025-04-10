import { extractFromYoutube } from "./extractors/youtube"
import { extractFromNaver } from "./extractors/naver"
import { extractFromGenericUrl } from "./extractors/generic"

export async function extractContent(url: string): Promise<string> {
  try {
    // Check if it's a YouTube URL
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return await extractFromYoutube(url)
    }

    // Check if it's a Naver blog URL
    if (url.includes("blog.naver.com")) {
      return await extractFromNaver(url)
    }

    // For other URLs, use a generic extractor
    return await extractFromGenericUrl(url)
  } catch (error) {
    console.error("Error extracting content:", error)
    throw new Error("Failed to extract content from the provided URL")
  }
}
