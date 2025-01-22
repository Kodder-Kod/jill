"use client"

import React, { useState } from 'react';
import { db, } from "../../../../config";
import { ref, push } from 'firebase/database';
import { createUserWithEmailAndPassword, sendEmailVerification, getAuth } from 'firebase/auth';
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md"
import { GiPadlock } from "react-icons/gi";
import { GiDialPadlock } from "react-icons/gi";
import { FaPhoneAlt } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useUserEmail, useUserID, useUserName, useUserPhone } from '../../../componets/zustand/profile';
import Link from 'next/link';
import { useUserTheme } from '@/app/componets/zustand/theme';
import { TbXboxX } from "react-icons/tb";
import { TiTick } from "react-icons/ti";



const Register = () => {

  //firebase 
  //auth

  const auth = getAuth();
  const user = auth.currentUser;

  const router = useRouter();

  //admin
  const [adminName, setAdminName] = useState('')
  const [adminPhone, setAdminPhone] = useState('')
  const [adminEmail, setAdminEmail] = useState('')


  const [adminPassword, setAdminPassword] = useState('')
  const [confirmpass, setConfirmpass] = useState('')


  const theme = useUserTheme((state) => state.userTheme)




  const registerUser = async () => {

    let userAccountId = null

    if (adminPassword.length < 6) {

      console.log("passpassword for 6", adminName)

    } else {
      if (adminPassword === confirmpass) {

        console.log("password is same ", adminName)
        if (!adminName || !adminPhone || !adminEmail || !adminPassword) {

        } else {
          try {
            // Create the user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
            console.log("create ime tii")
            try {    // Send email verification
              await sendEmailVerification(user, {
                handleCodeInApp: true,
                url: "https://chisendpos002.firebaseapp.com",
              });
              console.log("send verification imetii ")

            }
            catch {

              console.log("haiku work ")
            }

            // Save user details to the database
            const dbRef = ref(db, `web/pos/`);
            const newAdminRef = await push(dbRef, {

              Name: adminName,
              Phone: adminPhone,
              Email: adminEmail,

            })
            const newAdminKey = newAdminRef.key;

            userAccountId = newAdminKey


            useUserID.setState({ userID: newAdminKey })
            useUserPhone.setState({ userRole: adminPhone })
            useUserName.setState({ userName: adminName })
            useUserEmail.setState({ userEmail: adminEmail })

            try {
              const dbRef = ref(db, `user/accounts/`);
              const newAdminRef = push(dbRef, {

                Email: adminEmail,
                Id: userAccountId,
                Phone: adminPhone,
                Name: adminName,

              })
              const newAdminKey = newAdminRef.key;
            }
            catch {

              console.log("did not open user / account")
            }

            const route = router.push('/');


            // Reset form fields
            setAdminName('');
            setAdminEmail('');
            setAdminPassword('');
            setAdminPhone('');
            setConfirmpass('')


          } catch (error) {
            setAdminName('');
            setAdminEmail('');
            setAdminPassword('');
            setAdminPhone('');
            setConfirmpass('')

            console.log("Error during registration:", error.message);
          }
        }
      } else {
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setAdminPhone('');
        setConfirmpass('')


      }
    }
  };

  return (

    <>

      <div className={`flex items-center justify-center min-h-screen shadow-xl
               ${theme === "Dark"
          ? "bg-[#171941] "
          : " bg-gray-100  "
        }`}
      >
        <div className={` shadow-xl rounded-lg p-8 max-w-md w-full  
                ${theme === "Dark"
            ? "bg-[#132962] "
            : " bg-white "
          }`}>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/btc.png" alt="Logo" className="h-12 shadow-md " style={{ borderRadius: 15 }} />
          </div>


          {/* App Title */}
          <div className="flex justify-center mb-4">
            <h1 className={`text-2xl font-bold 
               ${theme === "Dark"
                ? "text-white "
                : "text-blue-800 "
              }`}
            >Chisend POS </h1>
          </div>

          <h2 className={`text-1xl font-semibold mb-6  px-2
             ${theme === "Dark"
              ? "text-white "
              : "text-blue-600 "
            }`}
          >Create an Account </h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter Business Name"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-600  pl-12 shadow-md"
                style={{ borderRadius: 9, color: "#000000" }}
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />

              <FaUser className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
              
                ${theme === "Dark"
                  ? "text-white "
                  : "text-blue-600 "
                }`}
              />

            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Phone"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2  focus:ring-blue-600   pl-12 shadow-md"
                style={{ borderRadius: 9, color: "#000000" }}
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
              />
              <FaPhoneAlt className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
               
                ${theme === "Dark"
                  ? "text-white "
                  : "text-blue-600 "
                }`}
              />

            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2  focus:ring-blue-600   pl-12 shadow-md"
                style={{ borderRadius: 9, color: "#000000" }}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <MdEmail className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
               
                ${theme === "Dark"
                  ? "text-white "
                  : "text-blue-600 "
                }`}
              />

            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600   pl-12 shadow-md"
                style={{ borderRadius: 9, color: "#000000" }}
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <GiPadlock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
               
                ${theme === "Dark"
                  ? "text-white "
                  : "text-blue-600 "
                }`}
              />

            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600   pl-12 shadow-md"
                style={{ borderRadius: 9, color: "#000000" }}
                value={confirmpass}
                onChange={(e) => setConfirmpass(e.target.value)}
              />
              <GiDialPadlock className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-xl
               
                ${theme === "Dark"
                  ? "text-white "
                  : "text-blue-600 "
                }`}
              />

            </div>

            <div className="flex justify-center items-center">
              <button
                onClick={registerUser}
                className={`w-1/2  p-3  mt-4 focus:outline-none focus:ring-2  shadow-md rounded-lg

                  ${theme === "Dark"
                    ? "text-white  bg-blue-800 hover:bg-blue-600 "
                    : "bg-blue-600 text-white  hover:bg-blue-800"
                  }`}
              >
                Register
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className={`text-sm  mb-4
              ${theme === "Dark"
                ? "text-white "
                : "text-gray-600 "
              }`}
            >Already have an account ? <Link href="/" className="text-blue-500 hover:underline">Log In</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}


export default Register 