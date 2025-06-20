import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { Instagram, Linkedin } from "lucide-react"

export default function Contact() {
  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 pb-12 px-6 w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/images/Untitled design (7).png"
              alt="Contact Illustration"
              width={500}
              height={400}
              className="w-full h-auto"
            />
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-blue-300">Connect with Us</h1>
            <p className="text-gray-300 mb-8">
              Reach out to us through any of the following means, and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  Email:
                </h2>
                <p className="text-gray-300 ml-5">photography.society@study.iitm.ac.in</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Social Media:</h2>
                <div className="flex space-x-4 ml-5">
                  <Link href="https://www.linkedin.com/company/iris-camera-society/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </Link>
                  <Link href="https://www.instagram.com/iris_iitm" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                    <Instagram className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
