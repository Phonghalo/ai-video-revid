"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Video, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface VideoProject {
  id: string
  title: string
  status: "draft" | "pending" | "building" | "ready" | "failed"
  createdAt: string
  videoId?: string
}

export default function VideosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [videos, setVideos] = useState<VideoProject[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/projects")
        if (!response.ok) {
          throw new Error("Failed to fetch videos")
        }

        const data = await response.json()
        setVideos(data)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to fetch videos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Videos</h1>
        <Link href="/">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Video
          </Button>
        </Link>
      </div>

      {videos.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">No videos yet</h3>
            <p className="text-muted-foreground mb-4">Create your first video to get started</p>
            <Link href="/">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle className="truncate">{video.title}</CardTitle>
                <CardDescription>Created {new Date(video.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      video.status === "ready"
                        ? "bg-green-500"
                        : video.status === "failed"
                          ? "bg-red-500"
                          : video.status === "building" || video.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                    }`}
                  />
                  <span className="capitalize">{video.status}</span>
                </div>
              </CardContent>
              <CardFooter>
                {video.status === "draft" && (
                  <Link href={`/edit-script?id=${video.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Continue Editing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {(video.status === "pending" || video.status === "building") && video.videoId && (
                  <Link href={`/video-status?id=${video.videoId}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Progress
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {video.status === "ready" && video.videoId && (
                  <Link href={`/video-status?id=${video.videoId}`} className="w-full">
                    <Button className="w-full">
                      Watch Video
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {video.status === "failed" && (
                  <Button variant="outline" className="w-full" disabled>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Creation Failed
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
