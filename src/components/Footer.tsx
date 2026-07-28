import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-4 mt-auto">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} <span className="font-semibold text-blue-600 dark:text-blue-400">SkySnapping</span>. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <a href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Home
          </a>
          <Link to="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            About
          </Link>
          <a
            href="https://fadmacharki.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Made by Fadma Charki
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;