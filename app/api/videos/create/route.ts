import { type NextRequest, NextResponse } from "next/server"
import { getProject, updateVideo } from "@/lib/db"
import { createVideo as createRevidVideo } from "@/lib/revid"
import { createVideo as createVideoRecord } from "@/lib/db"

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

    // Create a record in our database
    const video = await createVideoRecord({
      projectId,
      title: settings.title,
      status: "pending",
      webhookId,
    })

    // Update the video record with the revid.ai ID
    await updateVideo(video.id, {
      id: revidResponse.id,
    })

    return NextResponse.json({ videoId: revidResponse.id })
  } catch (error) {
    console.error("Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
