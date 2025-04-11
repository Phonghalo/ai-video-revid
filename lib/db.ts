import { createServerSupabaseClient } from "./supabase/server"

export interface Project {
  id: string
  title: string
  originalContent: string
  script: string
  status: "draft" | "pending" | "building" | "ready" | "failed"
  createdAt: string
  updatedAt: string
  videoId?: string
}

export interface Video {
  id: string
  projectId: string
  title: string
  status: "pending" | "building" | "ready" | "failed"
  progress: number
  url?: string
  error?: string
  createdAt: string
  updatedAt: string
  webhookId?: string
}

// Helper function to convert from database format to our application format
function mapProjectFromDb(project: any): Project {
  return {
    id: project.id,
    title: project.title,
    originalContent: project.original_content,
    script: project.script,
    status: project.status,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    videoId: project.video_id,
  }
}

// Helper function to convert from database format to our application format
function mapVideoFromDb(video: any): Video {
  return {
    id: video.id,
    projectId: video.project_id,
    title: video.title,
    status: video.status,
    progress: video.progress,
    url: video.url,
    error: video.error,
    createdAt: video.created_at,
    updatedAt: video.updated_at,
    webhookId: video.webhook_id,
  }
}

// Project methods
export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt" | "status">) {
  const supabase = createServerSupabaseClient()

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      title: data.title,
      original_content: data.originalContent,
      script: data.script,
      status: "draft",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    throw new Error("Failed to create project")
  }

  return mapProjectFromDb(project)
}

export async function getProject(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: project, error } = await supabase.from("projects").select().eq("id", id).single()

  if (error) {
    console.error("Error getting project:", error)
    return null
  }

  return mapProjectFromDb(project)
}

export async function updateProject(id: string, data: Partial<Omit<Project, "id" | "createdAt">>) {
  const supabase = createServerSupabaseClient()

  // Convert from our application format to database format
  const dbData: any = {}
  if (data.title) dbData.title = data.title
  if (data.originalContent) dbData.original_content = data.originalContent
  if (data.script) dbData.script = data.script
  if (data.status) dbData.status = data.status
  if (data.videoId !== undefined) dbData.video_id = data.videoId // Allow null values

  // Always update the updated_at timestamp
  dbData.updated_at = new Date().toISOString()

  const { data: project, error } = await supabase.from("projects").update(dbData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating project:", error)
    return null
  }

  return mapProjectFromDb(project)
}

export async function getAllProjects() {
  const supabase = createServerSupabaseClient()

  const { data: projects, error } = await supabase.from("projects").select().order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting all projects:", error)
    return []
  }

  return projects.map(mapProjectFromDb)
}

// Video methods
export async function createVideo(data: Omit<Video, "id" | "createdAt" | "updatedAt" | "progress">) {
  const supabase = createServerSupabaseClient()

  // For revid.ai videos, we might already have an ID
  const hasCustomId = !!data.id

  const insertData = {
    project_id: data.projectId,
    title: data.title,
    status: data.status || "pending",
    progress: 0,
    webhook_id: data.webhookId,
    ...(hasCustomId && { id: data.id }), // Only include ID if provided
  }

  const { data: video, error } = await supabase.from("videos").insert(insertData).select().single()

  if (error) {
    console.error("Error creating video:", error)
    throw new Error("Failed to create video")
  }

  // Update the associated project
  await updateProject(data.projectId, {
    status: "pending",
    videoId: video.id,
  })

  return mapVideoFromDb(video)
}

export async function getVideo(id: string) {
  const supabase = createServerSupabaseClient()

  const { data: video, error } = await supabase.from("videos").select().eq("id", id).single()

  if (error) {
    console.error("Error getting video:", error)
    return null
  }

  return mapVideoFromDb(video)
}

export async function updateVideo(id: string, data: Partial<Omit<Video, "id" | "createdAt" | "projectId">>) {
  const supabase = createServerSupabaseClient()

  // Convert from our application format to database format
  const dbData: any = {}
  if (data.title) dbData.title = data.title
  if (data.status) dbData.status = data.status
  if (data.progress !== undefined) dbData.progress = data.progress
  if (data.url) dbData.url = data.url
  if (data.error) dbData.error = data.error
  if (data.webhookId) dbData.webhook_id = data.webhookId

  // Always update the updated_at timestamp
  dbData.updated_at = new Date().toISOString()

  const { data: video, error } = await supabase.from("videos").update(dbData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating video:", error)
    return null
  }

  // Update the associated project if status changes
  if (data.status && ["ready", "failed"].includes(data.status)) {
    const { data: projectData } = await supabase.from("videos").select("project_id").eq("id", id).single()

    if (projectData) {
      await updateProject(projectData.project_id, {
        status: data.status as "ready" | "failed",
      })
    }
  }

  return mapVideoFromDb(video)
}

export async function getVideoByWebhookId(webhookId: string) {
  const supabase = createServerSupabaseClient()

  const { data: video, error } = await supabase.from("videos").select().eq("webhook_id", webhookId).single()

  if (error) {
    console.error("Error getting video by webhook ID:", error)
    return null
  }

  return mapVideoFromDb(video)
}

// New method to create or update a video with a specific ID (for revid.ai IDs)
export async function createOrUpdateVideo(data: Omit<Video, "createdAt" | "updatedAt">) {
  const supabase = createServerSupabaseClient()

  // Check if a video with this ID already exists
  const { data: existingVideo } = await supabase.from("videos").select().eq("id", data.id).single()

  if (existingVideo) {
    // Update existing video
    return updateVideo(data.id, {
      title: data.title,
      status: data.status,
      progress: data.progress,
      url: data.url,
      error: data.error,
      webhookId: data.webhookId,
    })
  } else {
    // Create new video with specific ID
    const insertData = {
      id: data.id,
      project_id: data.projectId,
      title: data.title,
      status: data.status || "pending",
      progress: data.progress || 0,
      url: data.url,
      error: data.error,
      webhook_id: data.webhookId,
    }

    const { data: video, error } = await supabase.from("videos").insert(insertData).select().single()

    if (error) {
      console.error("Error creating video with specific ID:", error)
      throw new Error("Failed to create video with specific ID")
    }

    // Update the associated project
    await updateProject(data.projectId, {
      status: "pending",
      videoId: video.id,
    })

    return mapVideoFromDb(video)
  }
}
