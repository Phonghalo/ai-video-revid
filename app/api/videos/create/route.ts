import { type NextRequest, NextResponse } from "next/server"
import { getProject } from "@/lib/db"
import { createVideo as createRevidVideo } from "@/lib/revid"
import { createOrUpdateVideo } from "@/lib/db"

export const maxDuration = 60 // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
  try {
    const { projectId, settings } = await request.json()

    if (!projectId || !settings) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const project = await getProject(projectId)

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Generate a unique webhook ID
    const webhookId = crypto.randomUUID()

    // Create a webhook URL
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const webhookUrl = `${baseUrl}/api/webhooks/revid/${webhookId}`

    // Create video in revid.ai
    const revidResponse = await createRevidVideo({
      script: project.script,
      title: settings.title,
      voice: settings.voice,
      style: settings.style,
      aspect: settings.aspect,
      webhookUrl,
    })

    // Create a record in our database with the revid.ai ID
    await createOrUpdateVideo({
      id: revidResponse.id,
      projectId,
      title: settings.title,
      status: "pending",
      progress: 0,
      webhookId,
    })

    return NextResponse.json({ videoId: revidResponse.id })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
