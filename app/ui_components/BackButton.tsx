import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"

export default function BackButton() {
  const navigate = useNavigate()

  const goHome = async () => {
    navigate("/")
  }

  return (
    <Button type="button" className="fixed" onClick={goHome}>Go Back</Button>
  )
}