"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Pause, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Voice {
	voice_id: string
	name: string
	preview_url: string
	labels: {
		accent?: string
		gender?: string
		age?: string
		description?: string
	}
}

interface VoiceSelectorProps {
	value: string
	onChange: (value: string) => void
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
	const [voices, setVoices] = useState<Voice[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [currentPreview, setCurrentPreview] = useState<string | null>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const { toast } = useToast()

	useEffect(() => {
		const fetchVoices = async () => {
			try {
				const response = await fetch("/api/voices")
				if (!response.ok) {
					throw new Error("Failed to fetch voices")
				}

				const data = await response.json()
				if (data.voices && Array.isArray(data.voices)) {
					setVoices(data.voices)

					// If no voice is selected yet and we have voices, select the first one
					if (!value && data.voices.length > 0) {
						onChange(data.voices[0].voice_id)
					}
				}
			} catch (error) {
				console.error("Error fetching voices:", error)
				toast({
					title: "Error",
					description: "Failed to fetch voices. Using default options instead.",
					variant: "destructive",
				})

				// Fallback to default voices if API fails
				setVoices([
					{
						voice_id: "default-female",
						name: "Female Voice",
						preview_url: "",
						labels: { gender: "female", accent: "american" },
					},
					{
						voice_id: "default-male",
						name: "Male Voice",
						preview_url: "",
						labels: { gender: "male", accent: "american" },
					},
				])
			} finally {
				setIsLoading(false)
			}
		}

		fetchVoices()
	}, [onChange, toast, value])

	const handlePlayPreview = (voiceId: string, previewUrl: string) => {
		if (currentPreview === voiceId && isPlaying) {
			// Stop playing
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.currentTime = 0
			}
			setIsPlaying(false)
		} else {
			// Start playing new preview
			if (audioRef.current) {
				audioRef.current.pause()
				audioRef.current.currentTime = 0
			}

			setCurrentPreview(voiceId)

			const audio = new Audio(previewUrl)
			audioRef.current = audio

			audio.onplay = () => setIsPlaying(true)
			audio.onended = () => setIsPlaying(false)
			audio.onpause = () => setIsPlaying(false)
			audio.onerror = () => {
				toast({
					title: "Error",
					description: "Failed to play voice preview.",
					variant: "destructive",
				})
				setIsPlaying(false)
			}

			audio.play().catch((error) => {
				console.error("Error playing audio:", error)
				toast({
					title: "Error",
					description: "Failed to play voice preview.",
					variant: "destructive",
				})
			})
		}
	}

	return (
		<div className="space-y-2">
			<Label htmlFor="voice">Voice</Label>
			<div className="space-y-4">
				<Select value={value} onValueChange={onChange} disabled={isLoading}>
					<SelectTrigger>
						<SelectValue placeholder={isLoading ? "Loading voices..." : "Select a voice"} />
					</SelectTrigger>
					<SelectContent>
						{isLoading ? (
							<div className="flex items-center justify-center py-2">
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Loading voices...
							</div>
						) : (
							voices.map((voice) => (
								<SelectItem key={voice.voice_id} value={voice.voice_id}>
									<div className="flex items-center justify-between w-full">
                    <span>
                      {voice.name}
	                    {voice.labels?.accent && ` (${voice.labels.accent})`}
                    </span>
									</div>
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>

				{/* Voice preview section */}
				{value && !isLoading && (
					<div className="pt-2">
						{voices.map((voice) => {
							if (voice.voice_id === value && voice.preview_url) {
								const isCurrentlyPlaying = currentPreview === voice.voice_id && isPlaying

								return (
									<div key={voice.voice_id} className="flex items-center space-x-2">
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => handlePlayPreview(voice.voice_id, voice.preview_url)}
										>
											{isCurrentlyPlaying ? (
												<>
													<Pause className="h-4 w-4 mr-2" />
													Stop Preview
												</>
											) : (
												<>
													<Play className="h-4 w-4 mr-2" />
													Preview Voice
												</>
											)}
										</Button>
										<span className="text-sm text-muted-foreground">
                      {voice.labels?.gender && voice.labels?.gender}
											{voice.labels?.description && `, ${voice.labels.description}`}
                    </span>
									</div>
								)
							}
							return null
						})}
					</div>
				)}
			</div>
		</div>
	)
}
