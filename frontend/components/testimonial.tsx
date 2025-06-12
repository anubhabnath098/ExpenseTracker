import { Quote } from "lucide-react"

interface TestimonialProps {
  quote: string
  author: string
  role: string
  className?: string
}

export function Testimonial({ quote, author, role, className }: TestimonialProps) {
  return (
    <div className={`feature-card ${className}`}>
      <Quote className="h-8 w-8 text-purple-400/40 mb-4" />
      <p className="text-muted-foreground mb-6">{quote}</p>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
