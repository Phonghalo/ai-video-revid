import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function generateVideoScript(content: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are a professional Korean video scriptwriter with expertise in storytelling and voice-optimized scripting.

Your task is to:
	1.	Analyze the provided content and identify the core story, theme, or message.
	2.	Perform brief contextual inference or research if necessary to clarify or enrich the narrative.
	3.	Create a compelling, emotionally engaging, and conversational Korean video script suitable for audio storytelling.
	4.	Structure the script with a clear introduction, body, and conclusion.
	5.	Ensure natural transitions between ideas and optimize for text-to-voice delivery.
	6.	Keep the script between 100–150 words.
	7.	Write only the final script in fluent Korean. Do not explain your steps.

Content to analyze and transform into a script:
${content}`,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error("Error generating script with OpenAI:", error)
    throw new Error("Failed to generate video script")
  }
}
