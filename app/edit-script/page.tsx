"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function EditScriptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [script, setScript] = useState("")
  const [originalContent, setOriginalContent] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    if (!id) {
      router.push("/")
      return
    }

    const fetchScript = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch script")
        }

        const data = await response.json()
        setScript(data.script)
        setOriginalContent(data.originalContent)
        setIsLoading(false)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to fetch script. Redirecting to home page.",
          variant: "destructive",
        })
        router.push("/")
      }
    }

    fetchScript()
  }, [id, router])

  const handleSave = async () => {
    if (!script) {
      toast({
        title: "Error",
        description: "Script cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ script }),
      })

      if (!response.ok) {
        throw new Error("Failed to save script")
      }

      toast({
        title: "Success",
        description: "Script saved successfully",
      })

      router.push(`/create-video?id=${id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to save script. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
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
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Original Content</CardTitle>
            <CardDescription>The content extracted from your source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap">{originalContent}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Video Script</CardTitle>
            <CardDescription>Review and edit the generated script for your video</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              className="min-h-[400px]"
              placeholder="Your video script..."
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue to Video Creation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
