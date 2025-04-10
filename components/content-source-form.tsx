"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function ContentSourceForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [url, setUrl] = useState("")
  const [script, setScript] = useState("")
  const { toast } = useToast()

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "url",
          content: url,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze content")
      }

      const data = await response.json()
      router.push(`/edit-script?id=${data.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleScriptSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!script) {
      toast({
        title: "Error",
        description: "Please enter a script",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "script",
          content: script,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze content")
      }

      const data = await response.json()
      router.push(`/edit-script?id=${data.id}`)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a New Video</CardTitle>
        <CardDescription>Start by providing a content source for your video</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="script">Custom Script</TabsTrigger>
          </TabsList>
          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="url">Enter URL</Label>
                <Input
                  id="url"
                  placeholder="https://blog.naver.com/... or https://www.youtube.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Supports Naver blogs, YouTube videos, and other article URLs
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Content"
                )}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="script">
            <form onSubmit={handleScriptSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="script">Enter Script</Label>
                <Textarea
                  id="script"
                  placeholder="Enter your script here..."
                  className="min-h-[200px]"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Script"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
