import { FaShieldAlt, FaCog, FaQuestionCircle } from "react-icons/fa";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-white border-t py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Engineering College Dashboard. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-4">
            <Link href="/help">
              <a className="text-gray-500 hover:text-gray-700 flex items-center">
                <FaQuestionCircle className="mr-1" /> Help
              </a>
            </Link>
            <Link href="/settings">
              <a className="text-gray-500 hover:text-gray-700 flex items-center">
                <FaCog className="mr-1" /> Settings
              </a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-500 hover:text-gray-700 flex items-center">
                <FaShieldAlt className="mr-1" /> Privacy
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
