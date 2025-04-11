import { type NextRequest, NextResponse } from "next/server"
import { getVideo, updateVideo, createOrUpdateVideo } from "@/lib/db"
import { getVideoStatus } from "@/lib/revid"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    let video = await getVideo(id)
    if (!video) {
      // If the video doesn't exist in our database yet, try to get it from revid.ai
      try {
        const revidStatus = await getVideoStatus(id)

        // Create a placeholder record in our database
        video = await createOrUpdateVideo({
          id: revidStatus.id,
          projectId: "unknown", // This will be updated when we get more info
          title: "Video from revid.ai",
          status: revidStatus.status as  "pending" | "building" | "ready" | "failed"  ,
          progress: revidStatus.progress,
          url: revidStatus.url,
          error: revidStatus.error,
        })

        return NextResponse.json(video)
      } catch (revidError) {
        console.error("Error getting video from revid.ai:", revidError)
        return NextResponse.json({ error: "Video not found" }, { status: 404 })
      }
    }

    // If the video is still processing, get the latest status from revid.ai
    if (video.status === "pending" || video.status === "building") {
      try {
        const status = await getVideoStatus(video.id)
        // Update our record with the latest status
        const updatedVideo = await updateVideo(video.id, {
          status: status.status as  "pending" | "building" | "ready" | "failed" | undefined,
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
