import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateVideoScript(content: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a professional video scriptwriter. Your task is to create a compelling video script based on the following content.

The script must be well-structured, engaging, and suitable for the video format.

Content:
${content}

Please create a video script that:
1. Has a clear introduction, body, and conclusion
2. Is conversational and engaging
3. Includes natural transitions between topics
4. Is optimized for visual storytelling
5. Is 300-500 words

Format the script with clear scene descriptions and dialogue/narration and translate it into Korean.
`,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating script with OpenAI:", error)
    throw new Error("Failed to generate video script")
  }
}
