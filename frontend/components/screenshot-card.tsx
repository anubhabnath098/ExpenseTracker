import type React from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ScreenshotCardProps {
  title: string
  description: string
  image: string
  alt: string
  reversed?: boolean
  className?: string
  style?: React.CSSProperties
}

export function ScreenshotCard({
  title,
  description,
  image,
  alt,
  reversed = false,
  className,
  style,
}: ScreenshotCardProps) {
  return (
    <div
      className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 ${className}`}
      style={style}
    >
      <div className="lg:w-1/2 space-y-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <Button variant="ghost" className="p-0 hover:bg-transparent group">
          <Link href="#" className="text-purple-400 group-hover:text-purple-300 transition-colors">Sign-up to access</Link>
          <ArrowRight className="ml-2 h-4 w-4 text-purple-400 group-hover:text-purple-300 transition-colors group-hover:translate-x-1 duration-300" />
        </Button>
      </div>
      <div className="lg:w-1/2 w-full">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 rounded-xl blur-xl opacity-70"></div>
          <div className="relative gradient-border rounded-xl overflow-hidden">
            <Image
              src={image || "/placeholder.svg"}
              alt={alt}
              width={800}
              height={600}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
