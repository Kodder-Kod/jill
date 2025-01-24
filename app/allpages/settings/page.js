"use client";

import { useState } from "react";
import { db } from "../../../config";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { ref, update, push, remove } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUserEmail, useUserID, useUserName, useUserPhone } from "../../componets/zustand/profile";
import { useUserEmployee, useUserEmployeeTotal } from "@/app/componets/zustand/employees";
import { useUserTheme } from "@/app/componets/zustand/theme";
import { TbXboxX } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import { useUserItems, useUserItemsData, useUserItemsTotal } from "@/app/componets/zustand/items";
import { useUserCategories, useUserCategoriesTotal } from "@/app/componets/zustand/categories";
import { useUserSupplier, useUserSupplierTotal } from "@/app/componets/zustand/supplier";
import { useUserSupplyItems, useUserSupplyItemsData, useUserSupplyItemsTotal } from "@/app/componets/zustand/supplyItems";
import { useUserCart, useUserCartData, useUserCartTotal } from "@/app/componets/zustand/cart";
import { useUserTicket, useUserTicketData, useUserTicketTotal } from "@/app/componets/zustand/ticket";



const Settings = () => {

    //// Zustand
    const Id = useUserID((state) => state.userID)
    const employees = useUserEmployee((state) => state.userEmployee)
    const employeestotal = useUserEmployeeTotal((state) => state.userEmployeeTotal)

    const theme = useUserTheme((state) => state.userTheme)


    //// General variables


    const [employeeName, setEmployeeName] = useState('')
    const [employeePhoneInput, setemployeePhoneInput] = useState('')

    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [userPhone, setUserPhone] = useState('')


    /// Edit profile 
    const editProfile = () => {

        if (Id) {

            if (userName && userEmail && userPhone) {
                try {
                    const dbRef = ref(db, `web/pos/${Id}`);
                    const newbranchRef = update(dbRef, {

                        Name: userName,
                        Email: userEmail,
                        Phone: userPhone,

                    });

                    const newCreditKey = newbranchRef.key;
                    setUserName('')
                    setUserEmail('')
                    setUserPhone('')
                    editAdminsuccessFun()
                }
                catch {
                    console.log('did not edit')
                    editAdminFailFun()
                }
            }
            else {
                console.log('fill all fields')
                editAdminFailBlankFun()
            }

        }

    };

    //// Add Employee
    const handleAddEmployee = () => {

        if (Id) {

            if (employeeName && employeePhoneInput) {
                try {
                    const dbRef = ref(db, `web/pos/${Id}/employees`);
                    const newbranchRef = push(dbRef, {

                        Name: employeeName,
                        Phone: employeePhoneInput,
                    });

                    const newCreditKey = newbranchRef.key;

                    setEmployeeName('')
                    setemployeePhoneInput('')
                    addEmployeesuccessFun()
                }
                catch {
                    console.log('did not Add employee')
                    addEmployeeFailFun()
                }
            }
            else {
                console.log('fill all fields')
                addEmployeeFailBlankFun()
            }

        }

    };

    const handleRemoveEmployee = (id) => {

        if (Id) {
            if (employeestotal == 1) {

                remove(ref(db, `web/pos/${Id}/employees`)).then(() => {

                    useUserEmployee.setState({ userEmployee: null });
                    useUserEmployeeTotal.setState({ userEmployeeTotal: null });
                    deleteEmployeesuccessFun()
                })
                    .catch((error) => {
                        deleteEmployeeFailFun()
                    });

            } else {

                remove(ref(db, `web/pos/${Id}/employees/${id}`)).then(() => {

                    deleteEmployeesuccessFun()
                })
                    .catch((error) => {

                        deleteEmployeeFailFun()

                    });
            }


        }


    };


    ///// Change password 
    const auth = getAuth();

    const [forgotemail, setForgetemail] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);

    const handleForgotPassword = () => {
        setModalOpen(true);
    };
    const closeModal = () => {
        setModalOpen(false);
    };


    const changepassword = async () => {

        if (forgotemail) {
            try {
                await sendPasswordResetEmail(auth, forgotemail);
                setForgetemail('');
                closeModal()
                passwordsuccessFun()

            } catch (error) {
                console.log("error on reset", error);
                setForgetemail('');
                closeModal()
                passwordFailFun()
            }
        } else {
            closeModal()
            passwodFailBlankFun()
        }
    };

    ///// Log out function 
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth)
                .then(() => {
                    router.push('/');
                    useUserID.setState({ userID: "" });
                    useUserName.setState({ userName: "" });
                    useUserEmail.setState({ userEmail: "" });
                    useUserPhone.setState({ userPhone: "" });
                    useUserEmployee.setState({ userEmployee: null })
                    useUserEmployeeTotal.setState({ userEmployeeTotal: null })
                    useUserItems.setState({ userItems: null })
                    useUserItemsTotal.setState({ userItemsTotal: null })
                    useUserItemsData.setState({ userItemsData: null })
                    useUserCategories.setState({ userCategories: null })
                    useUserCategoriesTotal.setState({ userCategoriesTotal: null })
                    useUserSupplier.setState({ userSupplier: null })
                    useUserSupplierTotal.setState({ userSupplierTotal: null })
                    useUserSupplyItems.setState({ userSupplyItems: null })
                    useUserSupplyItemsTotal.setState({ userSupplyItemsTotal: null })
                    useUserSupplyItemsData.setState({ userSupplyItemsData: null })
                    useUserCart.setState({ userCart: null })
                    useUserCartData.setState({ userCartData: null })
                    useUserCartTotal.setState({ userCartTotal: null })
                    useUserTicket.setState({ userTicket: null })
                    useUserTicketData.setState({ userTicketData: null })
                    useUserTicketTotal.setState({ userTicketTotal: null })
                })

        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    //// Auto Employee modals
    const [addEmployeeModalsuccess, setAddEmployeesuccess] = useState(false);
    const [addEmployeeModalFail, setAddEmployeeFail] = useState(false);
    const [addEmployeeModalFailBlank, setAddEmployeeFailBlank] = useState(false);

    const [deleteEmployeeModalsuccess, setDeleteEmployeesuccess] = useState(false);
    const [deleteEmployeeModalFail, setDeleteEmployeeFail] = useState(false);


    const addEmployeesuccessFun = () => {
        setAddEmployeesuccess(true);
        setTimeout(() => setAddEmployeesuccess(false), 1500);
    };

    const addEmployeeFailFun = () => {
        setAddEmployeeFail(true);
        setTimeout(() => setAddEmployeeFail(false), 1500);
    };

    const addEmployeeFailBlankFun = () => {
        setAddEmployeeFailBlank(true);
        setTimeout(() => setAddEmployeeFailBlank(false), 1500);
    };

    const deleteEmployeesuccessFun = () => {
        setDeleteEmployeesuccess(true);
        setTimeout(() => setDeleteEmployeesuccess(false), 1500);
    };

    const deleteEmployeeFailFun = () => {
        setDeleteEmployeeFail(true);
        setTimeout(() => setDeleteEmployeeFail(false), 1500);
    };


    //// Auto Profile Modal
    const [editAdminModalsuccess, setEditAdminsuccess] = useState(false);
    const [editAdminModalFail, setEditAdminFail] = useState(false);
    const [editAdminModalFailBlank, setEditAdminFailBlank] = useState(false);

    const [passwordModalsuccess, setPasswordSuccess] = useState(false);
    const [passwordModalFail, setPasswordFail] = useState(false);
    const [passwordModalFailBlank, setPasswordFailBlank] = useState(false);


    const editAdminFailBlankFun = () => {
        setEditAdminFailBlank(true);
        setTimeout(() => setEditAdminFailBlank(false), 1500);
    };

    const editAdminsuccessFun = () => {
        setEditAdminsuccess(true);
        setTimeout(() => setEditAdminsuccess(false), 1500);
    };

    const editAdminFailFun = () => {
        setEditAdminFail(true);
        setTimeout(() => setEditAdminFail(false), 1500);
    };

    const passwordsuccessFun = () => {
        setPasswordSuccess(true);
        setTimeout(() => setPasswordSuccess(false), 1500);
    };

    const passwordFailFun = () => {
        setPasswordFail(true);
        setTimeout(() => setPasswordFail(false), 1500);
    };

    const passwodFailBlankFun = () => {
        setPasswordFailBlank(true);
        setTimeout(() => setPasswordFailBlank(false), 1500);
    };


    return (
        <div className={`min-h-screen 
        ${theme === "Dark"
                ? "text-white "
                : "bg-gray-200 text-black rounded-lg"
            }`}>


            {/* Content */}
            <div className=" grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 p-5  ">
                {/* User Profile */}
                <section className={`py-4 px-4  
                    
                    ${theme === "Dark"
                        ? "text-white border rounded-xl border-blue-800"
                        : "bg-gray-100 text-black  rounded-md  shadow-xl "
                    }
                    `}>
                    <h2 className="text-lg font-bold mb-4">User Profile</h2>
                    <div>
                        <label htmlFor="username" className="block font-medium mb-2">
                            Business Name:
                        </label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Edit your Business Name "
                            className={`px-3 py-2 w-full mb-4  rounded-md
                                  ${theme === "Dark"
                                    ? "bg-gray-300"
                                    : "border text-black shadow-lg "
                                }
                    `}
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />

                        <div className="flex flex-row ">
                            <div >
                                <label htmlFor="email" className="block font-medium mb-2">
                                    Email:
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="Edit your email"
                                    className={`rounded-md  px-3 py-2 mb-4

                                     ${theme === "Dark"
                                            ? "bg-gray-300"
                                            : "border text-black shadow-lg "
                                        }
                    `}
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                />

                            </div>

                            <div className="mx-10">
                                <label htmlFor="email" className="block font-medium mb-2">
                                    Phone Number:
                                </label>
                                <input
                                    type="number"
                                    id="phone"
                                    placeholder="Edit Phone Number"
                                    className={`border rounded px-3 py-2  mb-4
                                     ${theme === "Dark"
                                            ? "bg-gray-300"
                                            : "border text-black shadow-lg "
                                        }
                    `}
                                    value={userPhone}
                                    onChange={(e) => setUserPhone(e.target.value)}
                                />

                            </div>

                        </div>

                        <div className="flex flex-row justify-between">
                            <button className={` py-2 px-4 rounded  
                             ${theme === "Dark"
                                    ? "text-white  bg-blue-800  hover:bg-blue-600   "
                                    : "bg-blue-600 text-white   hover:bg-blue-800"
                                }`}
                                onClick={editProfile}
                            >
                                Edit Profile
                            </button>

                            <button onClick={handleForgotPassword} className={` hover:underline text-sm 
                              ${theme === "Dark"
                                    ? "text-blue-400  "
                                    : " text-blue-700 "
                                }`}>
                                Change Password..
                            </button>

                            <button className={` text-white py-2 px-4 rounded 
                              ${theme === "Dark"
                                    ? "text-white  bg-red-800  hover:bg-red-600 "
                                    : "bg-red-600 text-white  hover:bg-red-780  "
                                }`}
                                onClick={handleLogout}>
                                Log Out
                            </button>

                        </div>

                    </div>
                </section>

                {/* Employee Management */}
                <section className={`p-4 
                    ${theme === "Dark"
                        ? "text-white border rounded-xl border-blue-800 "
                        : "bg-gray-100 text-black  rounded-md shadow-xl "
                    }
                    `}>
                    <h2 className="text-lg font-bold mb-4">Manage Employees</h2>
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Employee Name"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            className={` rounded px-3 py-3 w-full mb-3 
                                ${theme === "Dark"
                                    ? "bg-gray-300"
                                    : "border text-black shadow-lg "
                                }
                                `}
                        />
                        <input
                            type="number"
                            placeholder="Phone Number"
                            value={employeePhoneInput}
                            onChange={(e) => setemployeePhoneInput(e.target.value)}
                            className={` rounded px-3 py-3 w-full mb-2 
                                           ${theme === "Dark"
                                    ? "bg-gray-300"
                                    : "border text-black shadow-lg "
                                }
                                `}
                        />
                        <button
                            onClick={handleAddEmployee}
                            className={`py-2 px-4 rounded my-2
                               ${theme === "Dark"
                                    ? "text-white  bg-blue-800  hover:bg-blue-600   "
                                    : "bg-blue-600 text-white   hover:bg-blue-800"
                                }`}
                        >
                            Add Employee
                        </button>
                    </div>

                </section>


                {/* Theme Settings */}
                <section className={`  p-4 
                      ${theme === "Dark"
                        ? "text-white border rounded-xl border-blue-800 "
                        : "bg-gray-100 text-black  rounded-md shadow-xl "
                    }
                    `}>
                    <h2 className="text-lg font-bold mb-4">Theme Settings</h2>
                    <div>
                        <button
                            onClick={() => useUserTheme.setState({ userTheme: "Light" })}
                            className={`py-2 px-4 rounded mr-2 ${theme === "Dark"
                                ? "bg-gray-300 text-black hover:bg-gray-100"
                                : "bg-gray-100 text-black hover:bg-gray-200 rounded border shadow-lg"
                                }`}
                        >
                            Light
                        </button>
                        <button
                            onClick={() => useUserTheme.setState({ userTheme: "Dark" })}
                            className={`py-2 px-4 rounded ${theme === "Dark"
                                ? "bg-blue-800  text-white hover:bg-blue-600"
                                : "bg-blue-600 hover:bg-blue-800 text-white"
                                }`}
                        >
                            Dark
                        </button>
                    </div>
                    <p className="mt-4 font-medium">
                        Current Theme:
                        <span className="text-blue-500">{theme}</span>
                    </p>
                </section>

                <section
                    className={`py-4 px-4  
                            ${theme === "Dark"
                            ? "text-white border rounded-xl border-blue-800"
                            : "bg-gray-100 text-black  rounded-md  shadow-xl "
                        }
                                  `}>
                    <h2 className="text-lg font-bold mb-4">Employees</h2>
                    <ul>
                        {employees && employees.map((employee, index) => (
                            <li
                                key={index}
                                className={`flex justify-between items-center mb-2 p-2 bg-gray-100 border rounded

                                     ${theme === "Dark"
                                        ? " text-black bg-gray-300"
                                        : " bg-gray-100 "
                                    }`}
                            >
                                <span>
                                    {employee.Name} - {employee.Phone}
                                </span>
                                <button
                                    onClick={() => handleRemoveEmployee(employee.id)}
                                    className={` px-2 py-1 rounded

                                    ${theme === "Dark"
                                            ? "text-white  bg-red-800  hover:bg-red-600 "
                                            : "bg-red-600 text-white  hover:bg-red-780  "
                                        }`}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>

                </section>


            </div>

            {/* change password */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96" style={{ borderRadius: 9 }}>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">Reset Password</h2>
                        <p className="mb-4 text-gray-700">Enter your email to receive a password reset link:</p>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#303133]"
                            style={{ borderRadius: 9, color: "#000000" }}
                            value={forgotemail}
                            onChange={(e) => setForgetemail(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeModal}
                                className="bg-red-700 px-4 py-2 hover:bg-red-300"
                                style={{ borderRadius: 9, color: "#ffffff" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={changepassword}
                                className="bg-blue-500 px-4 py-2 text-white "
                                style={{ borderRadius: 9, backgroundColor: '#303133' }}>
                                Send Reset Link
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Auto-Close Employees */}
            {addEmployeeModalsuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>

                            <TiTick className='text-green-600 text-4xl  ' />
                            <h2 className="text-lg font-bold mb-4">Success</h2>
                        </div>
                        <p>Employee was Added</p>
                    </div>
                </div>
            )}

            {addEmployeeModalFail && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Employee was not Added</p>
                    </div>
                </div>
            )}

            {addEmployeeModalFailBlank && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Fill all Fields</p>
                    </div>
                </div>
            )}

            {deleteEmployeeModalsuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TiTick className='text-green-600 text-4xl  ' />
                            <h2 className="text-lg font-bold mb-4">Deleted</h2>
                        </div>
                        <p>Employee was Deleted</p>
                    </div>
                </div>
            )}

            {deleteEmployeeModalFail && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Employee was not Deleted</p>
                    </div>
                </div>
            )}


            {/**Password auto modal */}

            {editAdminModalsuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>

                            <TiTick className='text-green-600 text-4xl  ' />
                            <h2 className="text-lg font-bold mb-4">Success</h2>
                        </div>
                        <p>Profile was Edited</p>
                    </div>
                </div>
            )}

            {editAdminModalFail && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Profile was not Edited</p>
                    </div>
                </div>
            )}

            {editAdminModalFailBlank && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Fill all fields</p>
                    </div>
                </div>
            )}

            {passwordModalsuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>

                            <TiTick className='text-green-600 text-4xl  ' />
                            <h2 className="text-lg font-bold mb-4">Success</h2>
                        </div>
                        <p>Password Changed</p>
                    </div>
                </div>
            )}

            {passwordModalFail && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`} >
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Password did not change</p>
                    </div>
                </div>
            )}

            {passwordModalFailBlank && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Fill all Fields</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Settings;
