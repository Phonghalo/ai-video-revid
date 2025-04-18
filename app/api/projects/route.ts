import { type NextRequest, NextResponse } from "next/server"
import { getAllProjects } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const projects = await getAllProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
