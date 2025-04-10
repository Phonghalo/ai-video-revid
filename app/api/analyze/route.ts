import { type NextRequest, NextResponse } from "next/server"
import { extractContent } from "@/lib/content-extractor"
import { generateVideoScript } from "@/lib/openai"
import { createProject } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { type, content } = await request.json()

    if (!type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let extractedContent = ""

    if (type === "url") {
      // Extract content from URL
      extractedContent = await extractContent(content)
    } else if (type === "script") {
      // Use the provided script directly
      extractedContent = content
    } else {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 })
    }

    // Generate a script using OpenAI
    const script = await generateVideoScript(extractedContent)

    // Create a new project in the database
    const project = await createProject({
      title: `Video ${new Date().toLocaleDateString()}`,
      originalContent: extractedContent,
      script,
    })

    return NextResponse.json({ id: project.id })
  } catch (error) {
    console.error("Error analyzing content:", error)
    return NextResponse.json({ error: "Failed to analyze content" }, { status: 500 })
  }
}
