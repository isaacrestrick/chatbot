import { SignupForm } from "~/components/signup-form"
import { useState } from "react"
import { Button } from "~/components/ui/button"

export default function Signingup() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1 className="text-center pt-8 text-4xl">Welcome to the Researcher 🧠!</h1>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <SignupForm />
        </div>
      </div>

      {/* Way off-center counter button */}
      <div className="absolute" style={{ left: '85%', top: '15%' }}>
        <div className="flex flex-col gap-2 items-center">
          <div className="text-2xl font-bold">Count: {count}</div>
          <Button onClick={() => setCount(count + 1)}>
            Increment
          </Button>
        </div>
      </div>
    </div>
  )
}
