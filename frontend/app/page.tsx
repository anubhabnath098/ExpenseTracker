import { DollarSign, BarChart3, PieChart, Calendar, CreditCard, ArrowRight, ChevronDown } from "lucide-react"

import { AuthForm } from "@/components/auth-form"
import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/components/feature-card"
import { ScreenshotCard } from "@/components/screenshot-card"
import { Testimonial } from "@/components/testimonial"

export default function Home() {
  const features = [
    {
      title: "Expense Tracking",
      description: "Easily log and categorize your daily expenses with our intuitive interface.",
      icon: CreditCard,
    },
    {
      title: "Budget Management",
      description: "Create custom budgets for different categories and track your spending against them.",
      icon: PieChart,
    },
    {
      title: "Financial Reports",
      description: "Generate detailed reports and visualize your spending patterns over time.",
      icon: BarChart3,
    },
    {
      title: "Calendar View",
      description: "View your expenses in a calendar format to identify spending patterns.",
      icon: Calendar,
    },
  ]

  const screenshots = [
    {
      title: "Dashboard Overview",
      description: "Get a complete overview of your financial health with our comprehensive dashboard.",
      image: "/dashboard.png",
      alt: "Dashboard screenshot",
    },
    {
      title: "Expense Management",
      description: "Track and categorize all your expenses in one place with powerful filtering options.",
      image: "/expenses.png",
      alt: "Expenses screenshot",
    },
    {
      title: "Budget Planning",
      description: "Create and manage budgets for different categories to keep your spending in check.",
      image: "/budget.png",
      alt: "Budget screenshot",
    },
    {
      title: "Summary Reports",
      description: "Visualize your financial data with detailed reports and charts to make informed decisions.",
      image: "/dashboard-summary.png",
      alt: "summary report screenshot",
    },
  ]

  const testimonials = [
    {
      quote:
        "ExpenseTracker has completely transformed how I manage my finances. I've saved over $500 in the first month alone!",
      author: "Sarah Johnson",
      role: "Marketing Professional",
    },
    {
      quote:
        "The insights from the reports helped me identify and cut unnecessary expenses I didn't even realize I had.",
      author: "Michael Chen",
      role: "Software Engineer",
    },
    {
      quote:
        "Setting up budgets was so easy, and the notifications keep me accountable. Best financial decision I've made.",
      author: "Aisha Patel",
      role: "Small Business Owner",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden grid-pattern">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <DollarSign className="h-6 w-6 text-purple-400" />
              <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md animate-pulse-glow"></div>
            </div>
            <h1 className="text-xl font-bold gradient-text">ExpenseTracker</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#screenshots" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Screenshots
              </a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Testimonials
              </a>
            </nav>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 space-y-8 opacity-0 animate-slide-up">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="gradient-text">Take Control</span> of Your Financial Future
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Track expenses, set budgets, and gain insights into your spending habits with our powerful expense
                tracker designed for modern financial management.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Sign up to Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-muted-foreground">Always free to use</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-muted-foreground">Hassle free budgeting</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-muted-foreground">Track expenses</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full max-w-md opacity-0 animate-slide-up delay-200">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-70 animate-pulse-glow"></div>
                <div className="relative gradient-border glass-effect rounded-xl p-1">
                  <AuthForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-slide-up">
            <h2 className="text-3xl font-bold mb-4 gradient-text">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">
              ExpenseTracker comes packed with all the tools you need to manage your finances effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className={`opacity-0 animate-slide-up delay-${(index + 1) * 100}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Screenshots Section */}
      <section id="screenshots" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-slide-up">
            <h2 className="text-3xl font-bold mb-4 gradient-text">See It In Action</h2>
            <p className="text-muted-foreground text-lg">
              Explore the intuitive interface and powerful features that make ExpenseTracker the best choice for
              managing your finances.
            </p>
          </div>

          <div className="space-y-24">
            {screenshots.map((screenshot, index) => (
              <ScreenshotCard
                key={index}
                title={screenshot.title}
                description={screenshot.description}
                image={screenshot.image}
                alt={screenshot.alt}
                reversed={index % 2 !== 0}
                className="opacity-0 animate-slide-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 opacity-0 animate-slide-up">
            <h2 className="text-3xl font-bold mb-4 gradient-text">What Our Users Say</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied users who have transformed their financial management with ExpenseTracker.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Testimonial
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
                className={`opacity-0 animate-slide-up delay-${(index + 1) * 100}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
