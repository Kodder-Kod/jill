"use client "

import { FaPhone, FaEnvelope, FaGlobe } from "react-icons/fa";

import React from 'react';


const Footer = () => {


    return (

        <div className="flex items-center justify-between bg-gray-800 text-white p-4 shadow-md">
            {/* Company Information */}
            <div className="text-sm">
                © {new Date().getFullYear()} Business Name POS. All Rights Reserved.
            </div>

            {/* Quick Links */}
            <div className="flex space-x-6">
                <a
                    href="tel:+1234567890"
                    className="flex items-center text-sm hover:text-blue-400"
                >
                    <FaPhone className="mr-2" />
                    +254 794410921
                </a>
                <a
                    href="https://gmail.com"
                    className="flex items-center text-sm hover:text-blue-400"
                >
                    <FaEnvelope className="mr-2" />
                    support@businessname.com
                </a>
                <a
                    href="https://gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm hover:text-blue-400"
                >
                    <FaGlobe className="mr-2" />
                    businessname.com
                </a>
            </div>

            {/* Additional Info */}
            <div className="text-sm ">

                <a href="https://chisend.vercel.app" className="font-bold text-sm hover:text-blue-400 flex items-center">

                    <FaGlobe className="mr-2" />
                    Designed by Chisend</a>
            </div>
        </div>
    )
}

export default Footer