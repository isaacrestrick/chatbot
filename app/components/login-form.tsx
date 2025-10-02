import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Form, useNavigate, Link } from "react-router"
import { authClient } from "~/lib/auth-client"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const signIn = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onRequest: (ctx) => {
          // show loading state

        },
        onSuccess: (ctx) => {

          // redirect to home
          navigate("/")
        },
        onError: (ctx) => {

          alert(ctx.error)
        },
      },
    )
  }
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
        provider: "google"
    },
      {
        onRequest: (ctx) => {
          // show loading state

        },
        onSuccess: (ctx) => {

          // redirect to home
          navigate("/")
        },
        onError: (ctx) => {

          alert(ctx.error)
        },
      },
    )
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={signIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="joseph@mama.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/*<a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>*/}
                </div>
                <Input id="password" type="password" name="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <Button variant="outline" type="button" className="w-full" onClick={signInWithGoogle}>
                  Login with Google
                </Button>
              </div>
            </div>
            {<div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4" >
                Sign up
              </Link>
            </div>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
