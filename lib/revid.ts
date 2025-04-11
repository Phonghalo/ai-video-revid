export interface RevidVideoOptions {
  script: string
  title: string
  voice: string
  style: string
  aspect: string
  webhookUrl?: string
}

export interface RevidVideoResponse {
  id: string
  status: string
}

export interface RevidVideoStatus {
  id: string
  status: string
  progress: number
  url?: string
  error?: string
}

export async function createVideo(options: RevidVideoOptions): Promise<RevidVideoResponse> {
  try {
    const apiKey = process.env.REVID_API_KEY
    if (!apiKey) {
      throw new Error("REVID_API_KEY is not defined")
    }

    // Map aspect ratio to the format expected by revid.ai
    const aspectRatioMap: Record<string, string> = {
      "16:9": "16 / 9",
      "9:16": "9 / 16",
      "1:1": "1 / 1",
    }

    // Map voice to the format expected by revid.ai
    // Note: In a real implementation, you would have a mapping of voice IDs
    // For now, we'll use a placeholder ID
    const voiceIdMap: Record<string, string> = {
      "ko-KR-SunHiNeural": "EXAVITQu4vr4xnSDxMaL",  // Hyejin - nữ
      "ko-KR-InJoonNeural": "TxGEqnHWrfWFTfGW9XjX", // Minjun - nam
      "ko-KR-JisooNeural": "MF3mGyEYCl7XYWbV9V6O",  // Jisoo - nữ
      "ko-KR-HyunwooNeural": "ErXwobaYiN019PkySvjV", // Hyunwoo - nam
      "en-US-JennyNeural": "21m00Tcm4TlvDq8ikWAM", // Rachel - female, US
      "en-US-GuyNeural": "TxGEqnHWrfWFTfGW9XjX",   // Josh - male, US
      "en-GB-SoniaNeural": "MF3mGyEYCl7XYWbV9V6O",  // Elli - female, UK
      "en-GB-RyanNeural": "ErXwobaYiN019PkySvjV"    // Antoni - male, UK
    };

    // Map style to the format expected by revid.ai
    const stylePromptMap: Record<string, string> = {
      leonardo: "LEONARDO",
      anime: "ANIME",
      realism: "REALISM",
      illustration: "ILLUSTRATION",
      sketch_color: "SKETCH_COLOR",
      sketch_bw: "SKETCH_BW",
      pixar: "PIXAR",
      ink: "INK",
      render_3d: "RENDER_3D",
      lego: "LEGO",
      scifi: "SCIFI",
      recro_cartoon: "RECRO_CARTOON",
      pixel_art: "PIXEL_ART",
      creative: "CREATIVE",
      photography: "PHOTOGRAPHY",
      raytraced: "RAYTRACED",
      environment: "ENVIRONMENT",
      fantasy: "FANTASY",
      anime_sr: "ANIME_SR",
      movie: "MOVIE",
      stylized_illustration: "STYLIZED_ILLUSTRATION",
      manga: "MANGA",
    };

    const response = await fetch("https://www.revid.ai/api/public/v2/render", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: apiKey,
      },
      redirect: 'follow',
      body: JSON.stringify({
        webhook: options.webhookUrl || "",
        creationParams: {
          mediaType: "stockVideo",
          captionPresetName: "Wrap 1",
          selectedVoice: options.voice,
          hasEnhancedGeneration: true,
          generationPreset: stylePromptMap[options.style] ||"LEONARDO",
          generationUserPrompt: "Default style",
          selectedAudio: "Observer",
          origin: "/create",
          inputText: options.script,
          flowType: "text-to-video",
          slug: "create-tiktok-video",
          hasToGenerateVoice: true,
          hasToTranscript: false,
          hasToSearchMedia: true,
          hasAvatar: false,
          hasWebsiteRecorder: false,
          hasTextSmallAtBottom: false,
          ratio: aspectRatioMap[options.aspect] || "16 / 9",
          sourceType: "contentScraping",
          selectedStoryStyle: {
            value: "custom",
            label: "Custom",
          },
          hasToGenerateVideos: true,
          audioUrl: "https://cdn.revid.ai/audio/observer.mp3",
        },
      }),
    })


    if (!response?.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to create video")
    }

    const data = await response.json()
    return {
      id: data.pid || data.id,
      status: data.status || "pending",
    }
  } catch (error) {
    console.error("Error creating video with revid.ai:", error)
    throw new Error("Failed to create video with revid.ai")
  }
}

export async function getVideoStatus(id: string): Promise<RevidVideoStatus> {
  try {
    const apiKey = process.env.REVID_API_KEY
    if (!apiKey) {
      throw new Error("REVID_API_KEY is not defined")
    }

    // Add a cache buster to ensure fresh data
    const cacheBuster = Date.now()
    const url = `https://www.revid.ai/api/public/v2/status?pid=${id}&_=${cacheBuster}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        key: apiKey,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to get video status")
    }

    const data = await response.json()
    console.log(data)

    return {
      id: data.pid || id,
      status: mapRevidStatus(data.status),
      progress: calculateProgress(data),
      url: data.videoUrl || data.url,
      error: data?.error,
    }
  } catch (error) {
    console.error("Error getting video status from revid.ai:", error)
    throw new Error("Failed to get video status from revid.ai")
  }
}
export async function getProjects(limit = 10): Promise<any[]> {
  try {
    const apiKey = process.env.REVID_API_KEY
    if (!apiKey) {
      throw new Error("REVID_API_KEY is not defined")
    }

    const response = await fetch(`https://www.revid.ai/api/public/v2/projects?limit=${limit}`, {
      method: "POST", // Note: Using POST as per the curl example
      headers: {
        "Content-Type": "application/json",
        key: apiKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Failed to get projects")
    }

    const data = await response.json()
    return data.projects || []
  } catch (error) {
    console.error("Error getting projects from revid.ai:", error)
    throw new Error("Failed to get projects from revid.ai")
  }
}

// Helper function to map revid.ai status to our internal status
function mapRevidStatus(revidStatus: string): "pending" | "building" | "ready" | "failed" {
  const statusMap: Record<string, "pending" | "building" | "ready" | "failed"> = {
    pending: "pending",
    processing: "building",
    in_progress: "building",
    generating: "building",
    building: "building",
    rendering: "building",
    completed: "ready",
    done: "ready",
    ready: "ready",
    failed: "failed",
    error: "failed",
  }

  return statusMap[revidStatus.toLowerCase()] || "building"
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
  } else if (status.includes("" +
    "ready") || status.includes("done") || status.includes("ready")) {
    return 100
  } else if (status.includes("failed") || status.includes("error")) {
    return 0
  }

  // Default to 50% if we can't determine
  return 50
}
