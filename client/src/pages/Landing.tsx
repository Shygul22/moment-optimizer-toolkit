import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Timer, BarChart3, Zap, Target, Brain } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            <span className="text-indigo-600">TimeFlow</span>
          </h1>
        </div>
        
        <div className="ml-auto">
          <Button onClick={() => window.location.href = "/api/login"} className="bg-indigo-600 hover:bg-indigo-700">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
            Master Your <span className="text-indigo-600">Productivity</span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8">
            Streamline your tasks, track your time, and achieve your goals with intelligent insights and beautiful analytics.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"} 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6"
          >
            Get Started for Free
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 border-indigo-100 hover:border-indigo-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle className="text-indigo-700">Smart Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                AI-powered task prioritization and intelligent categorization to help you focus on what matters most.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Timer className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Precision time tracking with focus quality monitoring and intelligent break suggestions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-700">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Beautiful charts and insights to understand your productivity patterns and optimize your workflow.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-700">AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Machine learning algorithms analyze your habits to provide personalized productivity recommendations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-100 hover:border-red-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-700">Goal Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set meaningful goals and track your progress with visual indicators and milestone celebrations.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-100 hover:border-yellow-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-700">Energy Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your energy levels throughout the day and optimize your schedule for peak performance.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 shadow-lg">
          <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Productivity?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who have already optimized their workflow with TimeFlow.
          </p>
          <Button 
            onClick={() => window.location.href = "/api/login"} 
            size="lg" 
            className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6"
          >
            Start Your Journey Today
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 TimeFlow. Built for productivity enthusiasts.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;