import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateVideoScript(content: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a professional video scriptwriter. Your task is to write a compelling video script based on the content below.

The script should:
	1.	Have a clear introduction, body, and conclusion
	2.	Be written in a conversational and engaging tone
	3.	Include smooth, natural transitions between ideas
	4.	Be optimized for audio storytelling (text-to-voice AI)
	5.	Be 300–500 words in total
	6.	Be written entirely in Korean without scene or narration labels

Only return the final script in fluent Korean without any contextual or structural annotations.

Content:
${content}`,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating script with OpenAI:", error)
    throw new Error("Failed to generate video script")
  }
}
