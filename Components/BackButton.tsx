import { useRouter } from "next/navigation";
import { FaArrowLeftLong } from "react-icons/fa6";

const BackButton =()=>{
    const router = useRouter();
    return(
        <div onClick={() => router.back()} className="absolute left-4 cursor-pointer rounded-full bg-white/10 p-2 md:left-4 lg:left-8 top-14 sm:top-14 md:top-14 lg:top-16">
                  <FaArrowLeftLong  />
                </div>
    )
}
export default BackButton