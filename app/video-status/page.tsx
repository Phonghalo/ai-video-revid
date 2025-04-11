"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Home, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface VideoStatus {
  id: string
  status: "pending" | "building" | "ready" | "failed"
  progress: number
  url?: string
  error?: string
  title: string
  createdAt: string
}

export default function VideoStatusPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [videoStatus, setVideoStatus] = useState<VideoStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const fetchVideoStatus = async () => {
    if (!id) return

    try {
      const response = await fetch(`/api/videos/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch video status")
      }

      const data = await response.json()
      setVideoStatus(data)

      if (data.status === "ready" || data.status === "failed") {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }

      return data
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fetch video status",
        variant: "destructive",
      })

      if (pollingRef.current) {
        clearInterval(pollingRef.current)
        pollingRef.current = null
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!id) {
      router.push("/")
      return
    }

    fetchVideoStatus()

    // Start polling for updates
    pollingRef.current = setInterval(() => {
      fetchVideoStatus()
    }, 5000) // Poll every 5 seconds

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [id, router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchVideoStatus()
  }

  const handleDownload = () => {
    if (videoStatus?.url) {
      window.open(videoStatus.url, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
        <Home className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{videoStatus?.title || "Video Creation"}</CardTitle>
          <CardDescription>
            {videoStatus?.status === "pending" && "Your video is in the queue..."}
            {videoStatus?.status === "building" && "Your video is being created..."}
            {videoStatus?.status === "ready" && "Your video is ready!"}
            {videoStatus?.status === "failed" && "Video creation failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(videoStatus?.status === "pending" || videoStatus?.status === "building") && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Progress</span>
                <span>{videoStatus.progress}%</span>
              </div>
              <Progress value={videoStatus.progress} className="h-2" />
            </div>
          )}

          {videoStatus?.status === "ready" && videoStatus.url && (
            <div className="aspect-video">
              <video
                src={videoStatus.url}
                controls
                className="w-full h-full rounded-md"
                poster="/placeholder.svg?height=480&width=854"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {videoStatus?.status === "failed" && (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              <p className="font-medium">Error creating video</p>
              <p className="text-sm">{videoStatus.error || "An unknown error occurred"}</p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>Video ID: {videoStatus?.id}</p>
            <p>Created: {videoStatus?.createdAt && new Date(videoStatus.createdAt).toLocaleString()}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || videoStatus?.status === "ready"}
          >
            {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">Refresh Status</span>
          </Button>

          {videoStatus?.status === "ready" && videoStatus.url && (
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Video
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
