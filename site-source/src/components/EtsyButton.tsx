
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface EtsyButtonProps {
  url: string;
  status?: string;
  price?: number;
  className?: string;
}

const EtsyButton = ({ url, status, price, className = "" }: EtsyButtonProps) => {
  const isAvailable = status === 'active';
  
  return (
    <Button
      asChild
      variant={isAvailable ? "default" : "outline"}
      className={`bg-orange-600 hover:bg-orange-700 text-white ${
        !isAvailable ? 'opacity-60 cursor-not-allowed' : ''
      } ${className}`}
      disabled={!isAvailable}
    >
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        <span>Buy on Etsy</span>
        {price && <span className="text-sm">${price.toFixed(2)}</span>}
        <ExternalLink size={16} />
      </a>
    </Button>
  );
};

export default EtsyButton;
