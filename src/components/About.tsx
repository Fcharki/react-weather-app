import Lottie from "lottie-react";
import loadingAnimation from '../assets/animations/about-animation.json';

const About: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-200 via-white to-blue-300 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <Lottie 
        animationData={loadingAnimation} 
        loop={true} 
        className="w-80 h-80 sm:w-72 sm:h-72 rounded-lg mb-6"
      />

      <div className="text-center max-w-md bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-blue-900">SkySnapping</h1>
        <p className="text-gray-800 text-md sm:text-lg font-medium my-3">
          SkySnapping is a minimalist, modern weather app designed to provide accurate daily and weekly forecasts with a clean and immersive UI. Stay updated with real-time weather updates adapted to your location.
        </p>
      </div>

      <p className="italic text-md font-semibold mt-6">
        Made by{" "}
        <a
          className="text-blue-600 hover:text-blue-700 underline"
          href="https://fadmacharki.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fadma Charki
        </a>
      </p>
    </div>
  );
};

export default About;
