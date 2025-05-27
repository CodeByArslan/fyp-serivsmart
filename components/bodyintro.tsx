import Image from "next/image";
import carInteriorImage from "../public/images/interior.png"; // Example image path
import carCleaningImage from "../public/images/exterior.png"; // Example image path

const BodySection = () => {
  return (
    <section className="bg-white py-10 px-6 md:px-20">
      <div className="flex flex-col md:flex-row gap-10 items-center">
        {/* Heading Section */}
        <div className="md:w-1/2">
          <h4 className="text-blue-500 text-sm uppercase font-semibold mb-2">
            Get to Know Us
          </h4>
          <h1 className="text-[#173049] text-3xl font-bold mb-4">
            Welcome to ServiSmart Car Wash Center
          </h1>
          <p className="text-orange-500 text-lg font-semibold mb-4">
            We have alot of talented people who are working with us.
          </p>
          <p className="text-gray-600 mb-6">
            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even you are going to use a passage.
          </p>
          <div className="flex justify-between">
            <div>
              <p className="text-[#173049] text-lg font-bold">90%</p>
              <p className="text-sm text-gray-600">Interior Washing</p>
            </div>
            <div>
              <p className="text-[#173049] text-lg font-bold">50%</p>
              <p className="text-sm text-gray-600">Quality Cleaning</p>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className="md:w-1/2 grid gap-6">
          <div className="relative">
            <Image
              src={carInteriorImage}
              alt="Car Interior Cleaning"
              className="rounded-lg w-full"
            />
          </div>
          <div className="relative">
            <Image
              src={carCleaningImage}
              alt="Car Exterior Cleaning"
              className="rounded-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BodySection;
