type ErrorBannerProps = {
  message: string;
};

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  return (
    <div className="text-red-500 px-3 my-3">
      {message}
    </div>
  );
};

export default ErrorBanner;
