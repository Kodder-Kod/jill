"use client"

import React, { useState } from 'react';
import { db, } from "../../../../config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { ref, get } from 'firebase/database';
import { useUserEmail, useUserID, useUserName, useUserPhone, } from '../../../componets/zustand/profile';
import { MdEmail } from "react-icons/md"
import { GiPadlock } from "react-icons/gi";
import { useUserTheme } from '@/app/componets/zustand/theme';
import { TbXboxX } from "react-icons/tb";

import { TiTick } from "react-icons/ti";


const LogIn = () => {


    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [isModalOpen, setModalOpen] = useState(false);

    const [forgotemail, setForgetemail] = useState("");


    const theme = useUserTheme((state) => state.userTheme)


    const auth = getAuth();


    const handleForgotPassword = () => {
        setModalOpen(true); // Show modal when the link is clicked
    };

    const closeModal = () => {
        setModalOpen(false); // Hide modal
    };


    const LoginUser = async () => {

        if (!name || !password) {

        } else {

            try {
                const userCredential = await signInWithEmailAndPassword(auth, name, password);
                const user = userCredential.user;

                setName('')
                setPassword('')

                const Role = await fetchRole(name)

            }
            catch (error) {
                console.log(error.message)

                setName('')
                setPassword('')

            }

        }
    }

    const changepassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            setForgetemail('');

        } catch (error) {
            console.log("error on reset", error);
            setForgetemail('');
        }
    };


    const fetchRole = async (email) => {

        const snapshot = await get(ref(db, `user/accounts/`));
        const data = snapshot.val();

        if (data) {

            let emailUser = null;
            let id = null;
            let nameUser = null;
            let phoneUser = null;

            Object.entries(data).forEach(([key, value]) => {
                if (value.Email === email) {
                    emailUser = value.Email;
                    nameUser = value.Name;
                    phoneUser = value.Phone;
                    id = value.Id

                    console.log(id, "id.....id1")

                    return;
                }
            }
            );

            useUserID.setState({ userID: id });
            useUserEmail.setState({ userEmail: emailUser });
            useUserPhone.setState({ userRole: phoneUser })
            useUserName.setState({ userName: nameUser })

        }
    }

    return (


        <div className={`flex items-center justify-center min-h-screen shadow-xl  
            ${theme === "Dark"
                ? "bg-[#171941] "
                : " bg-gray-100 "
            }`}
        >
            <div className={` shadow-xl p-8 max-w-md w-full rounded-xl
                        ${theme === "Dark"
                    ? "bg-[#132962] "
                    : " bg-white "
                }`}
            >

                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src="/btc.png" alt="Logo" className="h-12 shadow-md" style={{ borderRadius: 15 }} />
                </div>

                {/* App Title */}
                <div className="flex justify-center mb-4">
                    <h1 className={`text-2xl font-bold 
                      ${theme === "Dark"
                            ? "text-white "
                            : "text-blue-800 "
                        }`}

                    >Chisend POS</h1>
                </div>

                <h2 className={`text-1xl font-semibold mb-6 px-2
                
                   ${theme === "Dark"
                        ? "text-white "
                        : "text-blue-600 "
                    }`}
                >Log In</h2>

                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 focus:outline-none rounded focus:ring-2 focus:ring-blue-600 pl-12 shadow-md"
                            style={{ color: "#000000", borderRadius: 9 }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <MdEmail className={`absolute left-3 top-1/2 transform -translate-y-1/2  text-xl
                        
                              ${theme === "Dark"
                                ? "text-white "
                                : "text-blue-600 "
                            }`} />

                    </div>


                    {/* Password Input */}
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 focus:outline-none rounded focus:ring-2 focus:ring-[#303133] pl-12 shadow-md"
                            style={{ color: "#000000", borderRadius: 9 }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <GiPadlock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
                              ${theme === "Dark"
                                ? "text-white "
                                : "text-blue-600 "
                            }`}
                        />


                    </div>

                    {/* Log In Button */}
                    <div className="flex justify-center items-center">
                        <button
                            onClick={LoginUser}
                            className={`w-1/2  rounded-lg p-3 mt-4 focus:outline-none focus:ring-2 

                              ${theme === "Dark"
                                    ? "text-white  bg-blue-800 hover:bg-blue-600 "
                                    : "bg-blue-600 text-white  hover:bg-blue-800"
                                }`}

                        >
                            Log In
                        </button>
                    </div>
                </div>

                {/* Links */}


                <div className="flex justify-between items-center mt-6">
                    <p className={`text-sm mb-4
                      ${theme === "Dark"
                                ? "text-white "
                                : "text-gray-600 "
                            }`}
                    >Join us today . <a href="/allpages/user/register" className="text-blue-500 hover:underline">Create your account</a></p>
                    <button onClick={handleForgotPassword} className="text-blue-500 hover:underline text-sm ml-auto mt-6">
                        Forgot Password?
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 rounded" >
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Reset Password</h2>
                        <p className="mb-4 text-gray-700">Enter your email to receive a password reset link:</p>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#303133]"
                            value={forgotemail}
                            style={{ borderRadius: 13, color: "#000000" }}
                            onChange={(e) => setForgetemail(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="bg-red-700 px-4 py-2 rounded hover:bg-red-400"
                                style={{ color: "#ffffff", borderRadius: 9 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={changepassword}
                                className="bg-blue-500 px-4 py-2 text-white rounded "
                                style={{ backgroundColor: '#303133', borderRadius: 9 }}>
                                Send Reset Link
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}


export default LogIn 