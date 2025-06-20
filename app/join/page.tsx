import Image from "next/image"
import Navbar from "@/components/navbar"

export default function Join() {
  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 px-6 w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Image src="/images/logo.png" alt="IRIS Society Logo" width={120} height={120} className="mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Join IRIS Society</h1>
          <p className="text-gray-300 mb-2">Photography & Videography Society of IITM BS Degree</p>
          <p className="text-gray-400">Become a part of our creative community</p>
        </div>

        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 max-w-xl mx-auto">
          <form className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium mb-1">
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                id="phoneNumber"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="studentEmail" className="block text-sm font-medium mb-1">
                Student Email
              </label>
              <input
                type="email"
                id="studentEmail"
                pattern=".*@ds\.study\.iitm\.ac\.in$"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="example@ds.study.iitm.ac.in"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Must end with @ds.study.iitm.ac.in</p>
            </div>

            <div>
              <label htmlFor="house" className="block text-sm font-medium mb-1">
                House
              </label>
              <select
                id="house"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your house</option>
                <option value="Nampdapha">Nampdapha</option>
                <option value="Bandipur">Bandipur</option>
                <option value="Corbett">Corbett</option>
                <option value="Gir">Gir</option>
                <option value="Kanha">Kanha</option>
                <option value="Kaziranga">Kaziranga</option>
                <option value="Nallamala">Nallamala</option>
                <option value="Nilgiri">Nilgiri</option>
                <option value="Pichavaram">Pichavaram</option>
                <option value="Saranda">Saranda</option>
                <option value="Sundarbans">Sundarbans</option>
                <option value="Wayanand">Wayanand</option>
              </select>
            </div>

            <div>
              <label htmlFor="id" className="block text-sm font-medium mb-1">
                ID
              </label>
              <input
                type="text"
                id="id"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium mb-1">
                Gender
              </label>
              <input
                type="text"
                id="gender"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="yearOfStudy" className="block text-sm font-medium mb-1">
                Year of Study
              </label>
              <select
                id="yearOfStudy"
                className="w-full px-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select your year of study</option>
                <option value="Foundational">Foundational</option>
                <option value="Diploma">Diploma</option>
                <option value="Degree">Degree</option>
              </select>
            </div>

            <div className="flex items-start">
              <input type="checkbox" id="acknowledgment" className="mt-1 mr-2" required />
              <label htmlFor="acknowledgment" className="text-sm text-gray-300">
                I acknowledge that I have read and understood the rules and regulations of the IRIS Photography &
                Videography Society and agree to abide by them. I understand that failure to comply with these rules may
                result in the revocation of my membership.
              </label>
            </div>

            <button type="submit" className="btn-primary w-full">
              Submit Application
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
