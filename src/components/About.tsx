import Lottie from "lottie-react";
import sunny from '../assets/animations/sunny.json';
import sunAnimation from '../assets/animations/sun-animation.json';
import moonAnimation from '../assets/animations/moon-animation.json';

const About = () => {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-blue-300 px-4 pb-12 pt-32 backdrop-blur-sm">
      <div className="mb-6 grid w-full max-w-4xl grid-cols-1 place-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="hidden lg:block">
          <Lottie
            animationData={sunny}
            loop={true}
            className="h-56 w-56 sm:h-72 sm:w-72"
          />
        </div>

        <div>
          <Lottie
            animationData={sunAnimation}
            loop={true}
            className="h-56 w-56 sm:h-72 sm:w-72"
          />
        </div>

        <div className="hidden md:block">
          <Lottie
            animationData={moonAnimation}
            loop={true}
            className="h-56 w-56 sm:h-72 sm:w-72"
          />
        </div>
      </div>

      <div className="max-w-lg rounded-2xl bg-white bg-opacity-50 p-6 text-center shadow-lg backdrop-blur-sm">
        <h1 className="mb-2 text-2xl font-semibold text-blue-900 sm:text-3xl">SkySnapping</h1>
        <p className="my-3 text-base font-medium text-gray-800 sm:text-lg">
          <span className="text-yellow-500">SkySnapping </span>is a minimalist, modern weather app
          designed to provide accurate daily and weekly forecasts with a clean and immersive UI.
          Stay updated with real-time weather updates adapted to your location.
        </p>
      </div>

      <p className="mt-6 text-base font-semibold italic">
        Made by{" "}
        <a
          className="text-blue-600 underline hover:text-blue-700"
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
