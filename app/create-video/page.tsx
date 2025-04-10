"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Video } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {VoiceSelector} from "@/components/voice-selector";

interface VideoSettings {
  title: string
  voice: string
  style: string
  aspect: string
}

const VOICE_OPTIONS = [
  { value: "ko-KR-SunHiNeural", label: "SunHi (Korean Female)" },
  { value: "ko-KR-InJoonNeural", label: "InJoon (Korean Male)" },
  { value: "ko-KR-JisooNeural", label: "Jisoo (Korean Female)" },
  { value: "ko-KR-HyunwooNeural", label: "Hyunwoo (Korean Male)" },
  { value: "en-US-JennyNeural", label: "Jenny (US Female)" },
  { value: "en-US-GuyNeural", label: "Guy (US Male)" },
  { value: "en-GB-SoniaNeural", label: "Sonia (UK Female)" },
  { value: "en-GB-RyanNeural", label: "Ryan (UK Male)" }
];

const STYLE_OPTIONS = [
  { value: "leonardo", label: "Leonardo" },
  { value: "anime", label: "Anime" },
  { value: "realism", label: "Realism" },
  { value: "illustration", label: "Illustration" },
  { value: "sketch_color", label: "Sketch (Color)" },
  { value: "sketch_bw", label: "Sketch (B/W)" },
  { value: "pixar", label: "Pixar" },
  { value: "ink", label: "Ink" },
  { value: "render_3d", label: "3D Render" },
  { value: "lego", label: "Lego" },
  { value: "scifi", label: "Sci-Fi" },
  { value: "recro_cartoon", label: "Retro Cartoon" },
  { value: "pixel_art", label: "Pixel Art" },
  { value: "creative", label: "Creative" },
  { value: "photography", label: "Photography" },
  { value: "raytraced", label: "Raytraced" },
  { value: "environment", label: "Environment" },
  { value: "fantasy", label: "Fantasy" },
  { value: "anime_sr", label: "Anime SR" },
  { value: "movie", label: "Movie" },
  { value: "stylized_illustration", label: "Stylized Illustration" },
  { value: "manga", label: "Manga" }
];

const ASPECT_RATIO_OPTIONS = [
  { value: "16:9", label: "Landscape (16:9)" },
  { value: "9:16", label: "Portrait (9:16)" },
  { value: "1:1", label: "Square (1:1)" },
]

export default function CreateVideoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [script, setScript] = useState("")
  const [settings, setSettings] = useState<VideoSettings>({
    title: "",
    voice: VOICE_OPTIONS[0].value,
    style: STYLE_OPTIONS[0].value,
    aspect: ASPECT_RATIO_OPTIONS[0].value,
  })

  const { toast } = useToast()

  useEffect(() => {
    if (!id) {
      router.push("/")
      return
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }

        const data = await response.json()
        setScript(data.script)
        setSettings((prev) => ({
          ...prev,
          title: data.title || `Video ${new Date().toLocaleDateString()}`,
        }))
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to fetch project. Redirecting to home page.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    fetchProject()
  }, [id, router])

  const handleCreateVideo = async () => {
    if (!settings.title) {
      toast({
        title: "Error",
        description: "Please enter a title for your video",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`/api/videos/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: id,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create video")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Video creation started successfully",
      })

      router.push(`/video-status?id=${data.videoId}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create video. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
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
      <Button variant="ghost" onClick={() => router.push(`/edit-script?id=${id}`)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Script Editor
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Script</CardTitle>
            <CardDescription>The script that will be used to create your video</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap">{script}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Settings</CardTitle>
            <CardDescription>Customize how your video will look and sound</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Enter a title for your video"
              />
            </div>

            <VoiceSelector value={settings.voice} onChange={(value) => setSettings({ ...settings, voice: value })} />

            <div className="space-y-2">
              <Label htmlFor="style">Visual Style</Label>
              <Select value={settings.style} onValueChange={(value) => setSettings({ ...settings, style: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspect">Aspect Ratio</Label>
              <Select value={settings.aspect} onValueChange={(value) => setSettings({ ...settings, aspect: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleCreateVideo} disabled={isCreating} className="w-full">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Video...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Create Video
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
