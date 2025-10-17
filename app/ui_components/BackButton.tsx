import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";

type BackButtonProps = {
  beforeNavigate?: () => void | Promise<void>;
};

export default function BackButton({ beforeNavigate }: BackButtonProps) {
  const navigate = useNavigate();

  const goHome = async () => {
    if (beforeNavigate) {
      await beforeNavigate();
    }

    navigate("/");
  };

  return (
    <Button type="button" className="fixed" onClick={goHome}>
      Go Back
    </Button>
  );
}
