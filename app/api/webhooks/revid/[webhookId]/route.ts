import { type NextRequest, NextResponse } from "next/server"
import { getVideoByWebhookId, updateVideo } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { webhookId: string } }) {
  try {
    const webhookId = params.webhookId
    const video = await getVideoByWebhookId(webhookId)

    if (!video) {
      console.error("Video not found for webhook ID:", webhookId)
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    const data = await request.json()
    console.log("Webhook data received:", data)

    // Map the webhook data to our internal format
    const status = data.status ? mapRevidStatus(data.status) : "processing"
    const progress = calculateProgress(data)
    const url = data.videoUrl || data.url
    const error = data.error

    // Update the video with the webhook data
    const updatedVideo = await updateVideo(video.id, {
      status,
      progress,
      url,
      error,
    })

    console.log("Video updated:", updatedVideo)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}

// Helper function to map revid.ai status to our internal status
function mapRevidStatus(revidStatus: string): "pending" | "processing" | "completed" | "failed" {
  const statusMap: Record<string, "pending" | "processing" | "completed" | "failed"> = {
    pending: "pending",
    processing: "processing",
    in_progress: "processing",
    generating: "processing",
    rendering: "processing",
    completed: "completed",
    done: "completed",
    ready: "completed",
    failed: "failed",
    error: "failed",
  }

  return statusMap[revidStatus.toLowerCase()] || "processing"
}

// Helper function to calculate progress percentage based on revid.ai status
function calculateProgress(data: any): number {
  // If progress is explicitly provided, use it
  if (typeof data.progress === "number") {
    return data.progress
  }

  // Otherwise, estimate based on status
  const status = (data.status || "").toLowerCase()

  if (status.includes("pending") || status.includes("queued")) {
    return 10
  } else if (status.includes("generating")) {
    return 30
  } else if (status.includes("rendering")) {
    return 70
  } else if (status.includes("completed") || status.includes("done") || status.includes("ready")) {
    return 100
  } else if (status.includes("failed") || status.includes("error")) {
    return 0
  }

  // Default to 50% if we can't determine
  return 50
}
