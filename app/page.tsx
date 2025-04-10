import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ContentSourceForm } from "@/components/content-source-form"

export const metadata: Metadata = {
  title: "Content-to-Video Generator",
  description: "Transform blog posts, YouTube videos, or custom scripts into engaging videos using AI.",
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">VideoCreator</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/videos">
              <Button variant="ghost">My Videos</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
          <div className="flex max-w-[980px] flex-col items-start gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
              Transform Content into Engaging Videos
            </h1>
            <p className="text-lg text-muted-foreground">
              Convert blog posts, YouTube videos, or custom scripts into professional videos using AI.
            </p>
          </div>
          <div className="w-full max-w-3xl mx-auto">
            <ContentSourceForm />
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} VideoCreator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
