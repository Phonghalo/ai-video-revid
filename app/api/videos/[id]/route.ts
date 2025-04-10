import { type NextRequest, NextResponse } from "next/server"
import { getVideo, updateVideo } from "@/lib/db"
import { getVideoStatus } from "@/lib/revid"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const video = await getVideo(params.id)

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // If the video is still processing, get the latest status from revid.ai
    if (video.status === "pending" || video.status === "processing") {
      try {
        const status = await getVideoStatus(video.id)

        // Update our record with the latest status
        const updatedVideo = await updateVideo(video.id, {
          status: status.status,
          progress: status.progress,
          url: status.url,
          error: status.error,
        })

        return NextResponse.json(updatedVideo)
      } catch (error) {
        // If we can't get the status from revid.ai, return the current record
        console.error("Error getting video status from revid.ai:", error)
        return NextResponse.json(video)
      }
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 })
  }
}
