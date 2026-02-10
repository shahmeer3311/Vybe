import React, { use, useState } from 'react'
import logo from "../assets/logo.png";
import MainLogo from "../assets/MainLogo.png";
import {useNavigate} from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const Signup = () => {
  const navigate=useNavigate();
  const [showPassword,setShowPassword]=useState(false);

  const [formData,setFormData]=useState({
    name: "",
    userName: "",
    email: "",
    password: "",
  });

  const [activeField,setActiveField]=useState({
    name: false,
    userName: false,
    email: false,
    password: false,
  });

  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]: e.target.value})
  };

  const handleFocus=(field)=>{
    setActiveField({...activeField,[field]: true})
  };

  const handleBlur=(field,value)=>{
    if(value.trim()===""){
      setActiveField({...activeField,[field]: false})
    }
  }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-linear-to-br from-black to-gray-800'>
        <div className="w-[65%] h-[80%] bg-white flex rounded-2xl overflow-hidden shadow-lg">
          <div className="w-full lg:w-[50%] h-full flex flex-col items-center p-8 gap-6">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-bold">Sign Up to</h1>
            <img src={MainLogo} className="w-20 h-10 font-bold" />
          </div> 

           <form className="w-full flex flex-col gap-5 mt-5">
             {["name", "userName", "email"].map((field)=>(
              <div key={field} className="w-full relative">
                 <input 
                 type={field==="email"? "email" : "text"}
                 name={field}
                 className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
                 value={formData[field]}
                 onChange={handleChange}
                 onFocus={() => handleFocus(field)}
                 onBlur={(e)=>handleBlur(field,e.target.value)}
                 />
                  <label className={`absolute left-4 text-gray-500 text-sm transition-all duration-200
                    ${activeField[field] || formData[field] ? "-top-2 bg-white text-black px-1 text-xs" : "top-3 text-sm"}
                    `}>
                    {field==="userName" ? "Username" : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
              </div>
             ))}

              <div className="w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="w-full border border-gray-300 rounded-lg px-4 pt-5 pb-2 pr-10 focus:outline-none focus:ring-2 focus:ring-black transition"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={(e) => handleBlur("password", e.target.value)}
                required
              />
              <label
                className={`absolute left-4 text-gray-500 transition-all duration-200 ${
                  activeField.password || formData.password
                    ? "-top-2 bg-white text-black px-1 text-xs"
                    : "top-3 text-sm"
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-600 hover:text-black"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-2xl cursor-pointer hover:bg-blue-600"
            >
              {/* {loginMutation.isLoading ? "Signing In..." : "Sign In"}
               */}. 
              Sign Up
            </button>

           </form>
           <p className="text-center mt-5 text-gray-500">
            Already have an account?{" "}
            <span className="font-bold text-black cursor-pointer" onClick={() => navigate("/login")}>
              Sign In
            </span>
          </p>
          </div>

           <div className="hidden lg:flex w-[50%] h-full justify-center items-center bg-black flex-col gap-10 text-white font-semibold rounded-l-[30px] shadow-2xl shadow-black">
          <p className="font-bold text-2xl">Welcome to Vybe</p>
          <img src={MainLogo} className="w-80 h-45" />
          <p className="font-bold text-[14px] text-center px-4">
            Join the community. Connect, share, and explore together.
          </p>
        </div>
        </div>
        
    </div>
  )
}

export default Signup
