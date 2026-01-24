import Loader from 'assets/icons/Loader.svg?react';
import { useEffect, useState } from 'react';

interface ButtonProps {
  primary?: boolean;
  onClick?: () => void | Promise<void>;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  primary = false,
  onClick = () => {},
  loading = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const externalLoading = loading;
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(externalLoading);
  }, [externalLoading]);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      {...props}
      className={`text-nowrap w-full py-[14px] md:px-[24px] rounded-lg duration-300 md:text-[15px] font-bold leading-5 md:leading-6 relative flex items-center justify-center ${
        primary
          ? 'bg-red-bg text-black hover:bg-red-bg-hover'
          : 'bg-input-light text-white hover:bg-input-light/80'
      } ${className}`}
      onClick={handleClick}
      disabled={isLoading}
    >
      {(isLoading || externalLoading) && (
        <Loader className="animate-spin h-4 w-4 md:h-6 md:w-6 absolute ml-[110px]" />
      )}
      <span className={`${isLoading ? 'opacity-70' : ''}`}>{children}</span>
    </button>
  );
}
