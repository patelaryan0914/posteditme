export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section - Branding */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 flex flex-col justify-between text-white">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">PostEdit</h1>
          <p className="text-lg md:text-xl text-blue-100">
            AI-Powered Post-Editing Platform
          </p>
        </div>

        <div className="hidden md:block space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">
              Transform Your Editing Workflow
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  ⚡️
                </div>
                <div>
                  <h3 className="font-medium">Lightning Fast</h3>
                  <p className="text-blue-100">
                    Accelerate your post-editing process with AI assistance
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  🎯
                </div>
                <div>
                  <h3 className="font-medium">Precision Perfect</h3>
                  <p className="text-blue-100">
                    Maintain high quality with intelligent suggestions
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  🔄
                </div>
                <div>
                  <h3 className="font-medium">Seamless Workflow</h3>
                  <p className="text-blue-100">
                    Integrate easily with your existing process
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-200">
            © 2025 PostEdit All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        {children}
      </div>
    </div>
  );
}
