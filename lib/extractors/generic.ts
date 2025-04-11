import {generateText} from "ai";
import {openai} from "@ai-sdk/openai";

export async function extractFromGenericUrl(url: string): Promise<string> {
  try {
    // In a real implementation, you would use a web scraping library or API
    // to extract the content from a generic URL
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are an AI assistant that extracts and summarizes **text content** from any web page.

Please parse the page at the following URL:

${url}

Instructions:
1. If it is a product page:
- Extract: product name, description, use case, ingredients (if any), volume/weight, list price, discount price, membership price, shipping policy, stock status, and seller name.
- If there are quantity options (1–2–3 units), list the price for each option.
2. If it is a blog, article, or information page:
- Summarize in 150–200 words.
- Highlight key points in bullet points if available.
3. Write clear and professional results in Vietnamese (or English if needed).
4. Include a source link at the end.

Note:
- Focus only on meaningful text.
- If the page is inaccessible, return general information`,
      maxTokens: 1000,
    })
    console.log(text)
    return text

    // For demonstration purposes, we'll use a simple fetch
  } catch (error) {
    console.error("Error extracting from generic URL:", error)
    throw new Error("Failed to extract content from URL")
  }
}
