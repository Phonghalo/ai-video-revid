import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
	try {
		const apiKey = process.env.REVID_API_KEY
		if (!apiKey) {
			return NextResponse.json({ error: "REVID_API_KEY is not defined" }, { status: 500 })
		}

		const response = await fetch("https://www.revid.ai/api/voice/getVoices", {
			method: "GET",
		})

		if (!response.ok) {
			const errorData = await response.json()
			return NextResponse.json({ error: errorData.message || "Failed to fetch voices" }, { status: response.status })
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error("Error fetching voices:", error)
		return NextResponse.json({ error: "Failed to fetch voices" }, { status: 500 })
	}
}
