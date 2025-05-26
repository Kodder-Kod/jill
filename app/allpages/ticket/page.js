"use client"

import React, { useState, useEffect } from "react";
import { ref, update, push, remove } from 'firebase/database';
import { db } from "../../../config";
import { MdEmail } from "react-icons/md"
import { useUserID } from "@/app/componets/zustand/profile";
import { useUserEmployee } from "@/app/componets/zustand/employees";
import { useUserTicket, useUserTicketData, useUserTicketTotal } from "@/app/componets/zustand/ticket";
import { useUserTheme } from "@/app/componets/zustand/theme";
import { FaTicketAlt, FaUsers } from "react-icons/fa";
import { TiTick } from "react-icons/ti";
import { QRCodeSVG } from 'qrcode.react';
import { TbXboxX } from "react-icons/tb";
import { useUserCart, useUserCartData, useUserCartTotal } from "@/app/componets/zustand/cart";
import { FaCashRegister } from "react-icons/fa";    

const Ticket = () => {


    // Zustand
    const Id = useUserID((state) => state.userID)
    const employees = useUserEmployee((state) => state.userEmployee)

    //  const items = useUserTicketData((state) => state.useTicketData)
    const items = useUserCartData((state) => state.userCartData)

    // const ticket = useUserTicket((state) => state.userTicket)
    const ticket = useUserCart((state) => state.userCart)

    //  const ticketTotal = useUserTicketTotal((state) => state.userTicketTotal)
    const ticketTotal = useUserCartTotal((state) => state.userCartTotal)
    const theme = useUserTheme((state) => state.userTheme)

    const [filteredTickets, setFilteredTickets] = useState(null);
    const [cart, setCart] = useState([]);

    const [selectedCashier, setSelectedCashier] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState(""); // initialize like this
    const [selectedTill, setSelectedTill] = useState("");

    //// Filter tickets for the selected employee 
    const handleEmployeeClick = (employeeName) => {


        console.log("employeefun", employeeName)

        setCart([])

        if (ticket) {

            const ticketsForEmployee = ticket.filter((t) => t.EmployeeID === employeeName);

            if (ticketsForEmployee.length == 0) {

                setFilteredTickets(null)
            }
            else {

                console.log("employeeb4 set  tickers ", employeeName)
                setFilteredTickets(ticketsForEmployee);
            }

        } else {
            console.log("there are no tickets")
        }

    };

    const handleTicketClick = (cartItems, cashier, date, time, till) => {
        setCart(cartItems);
        setSelectedCashier(cashier)
        setSelectedDate(date)
        setSelectedTill(till)
        setSelectedTime(time)
    };


    /// Maintain the total function
    const calculateTotal = (cart) => {
        if (!cart || cart.length === 0) {
            return 0;
        }
        return cart.reduce((sum, item) => sum + (item.stock * item.Price), 0);
    };

    useEffect(() => {
        setTotal(calculateTotal(cart));
    }, [cart]);



    /// General Variables
    const [selectEmployee, setSelectEmployee] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [total, setTotal] = useState(0);


    /// Modals
    const [sendModal, setSendModal] = useState(false);
    const [receiptModal, setReceiptModal] = useState(false);
    const [receiptModal1, setReceiptModal1] = useState(false);

    const receiptModalFun = () => setReceiptModal(false);

    const sendModalFun = () => {
        setSelectEmployee("")
        setSelectedCashier('')
        setSelectedDate('')
        setSelectedTill('')
        setSelectedTime('')
        setSendModal(false);
    }


    /// send to db
    const handleSend = () => {

        if (Id) {

            if (selectEmployee) {
                if (total == 0) {

                    console.log("total is zero")
                    sendModalFun()
                    sendFail()
                }

                else {
                    try {
                        const dbRef = ref(db, `web/pos/${Id}/cart/`);

                        const newbranchRef = push(dbRef, {

                            EmployeeID: selectEmployee,
                            Cart: cart,
                            Total: total,
                            Date: Date.now()

                        });
                        const newCreditKey = newbranchRef.key;

                        sendModalFun()
                        sendSuccess()
                        deleteTicket(selectEmployee)
                    }
                    catch {
                        console.log("did not send to DB")
                        sendModalFun()
                        sendFail()
                    }
                }
            }
            else {
                console.log("did not select employee ")
                sendModalFun()
                sendFailEmployee()

            }
        }
    };

    const [deleteId, setDeleteId] = useState()


    const sendFunction = (id) => {

        setSendModal(true)
        setDeleteId(id)

    }

    const deleteTicket = (employee) => {

        if (Id) {

            if (ticketTotal == 1) {

                remove(ref(db, `web/pos/${Id}/ticket`)).then(() => {

                    useUserTicket.setState({ userTicket: null });
                    useUserTicketTotal.setState({ userTicketTotal: null });
                    setFilteredTickets(null)

                })
                    .catch((error) => {
                        console.log("ticket was not deleted")
                    });

            } else {
                remove(ref(db, `web/pos/${Id}/ticket/${deleteId}`)).then(() => {
                    console.log("ticket was deleted")

                    handleEmployeeClick(employee)

                })
                    .catch((error) => {
                        console.log("ticket was not deleted")
                    });
            }

        }

    }


    ////  Auto close modals
    const [sendModalSuccess, setSendModalSuccess] = useState(false);
    const [sendModalFail, setSendModalFail] = useState(false);
    const [sendModalFailEmployee, setSendModalFailEmployee] = useState(false);


    const sendSuccess = () => {
        setSendModalSuccess(true);
        setTimeout(() => setSendModalSuccess(false), 1500);
    };


    const sendFail = () => {
        setSendModalFail(true);
        setTimeout(() => setSendModalFail(false), 1500);
    };


    const sendFailEmployee = () => {
        setSendModalFailEmployee(true);
        setTimeout(() => setSendModalFailEmployee(false), 1500);
    };



    ///////////////////////////////////////////////////////////////////////////////////////////


    const totalItems = cart.length;
    const totalQty = cart.reduce((sum, item) => sum + parseInt(item.stock), 0);
    const totalWeight = cart.reduce((sum, item) => sum + (parseFloat(item.Weight || 0) * parseInt(item.stock)), 0);

    // VAT Breakdown logic
    const vatBreakdown = {
        A: { vatable: 0, vat: 0 },
        E: { vatable: 0, vat: 0 },
        Z: { vatable: 0, vat: 0 }
    };

    cart.forEach(item => {
        const code = item.vatCode || 'A'; // Default to 'A' if not provided
        const qty = parseInt(item.stock);
        const price = parseFloat(item.Price);
        const vatableAmount = price * qty;
        const vatAmount = code === 'A' ? vatableAmount * 0.16 : 0; // 16% VAT for code A

        if (vatBreakdown[code]) {
            vatBreakdown[code].vatable += vatableAmount;
            vatBreakdown[code].vat += vatAmount;
        }
    });

    const format = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });




    return (

        <div className={`min-h-screen flex flex-col 
                  ${theme === "Dark"
                ? "text-white "
                : "bg-gray-200 text-black rounded-lg"
            }`}>


            {/* Main Layout */}
            {!receiptModal && (
                <div className="flex flex-col lg:flex-row flex-grow p-1">


                    <aside className="w-full lg:w-1/4 p-6 border-r  shadow-xl rounded-lg h-auto sm:h-screen flex flex-col">

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold ">Employees </h3>
                        </div>

                        {/* Employees Section */}
                        <div className="space-y-2 flex-1 overflow-y-auto">
                            {employees && employees.map((employees, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleEmployeeClick(employees.Name)}
                                    className={`w-full flex justify-between items-center p-1 py-3 rounded shadow-lg
                                  ${theme === "Dark"
                                            ? "  border border-blue-800  "
                                            : "bg-white hover:bg-blue-200 "
                                        }`}
                                >
                                    <p className="font-semibold text-sm">{employees.Name}</p>
                                </button>
                            ))}

                            {!employees &&
                                <div>
                                    <div className=" justify-center flex mt-20">
                                        <FaUsers className={` text-4xl 
                                    
                    ${theme === "Dark"
                                                ? " text-white"
                                                : " text-black "
                                            }`
                                        }
                                        />
                                    </div>
                                    <div className=" justify-center flex">

                                        <h1 className="text-lg mt-2">
                                            No Employee Added
                                        </h1>
                                    </div>
                                </div>
                            }
                        </div>
                    </aside>

                    <aside className="w-full lg:w-2/4 p-6 border-r shadow-md rounded-lg h-auto sm:h-screen flex flex-col">


                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold mr-20 ">Receipt Names</h3>
                        </div>


                        {/* Ticket names */}
                        <div className="grid grid-cols-1 gap-3 px-1 pt-2 overflow-y-auto"
                        >
                            {filteredTickets && filteredTickets.map((ticket, index) => (
                                <button
                                    key={index}
                                    style={{ borderRadius: 5 }}

                                    onClick={() => handleTicketClick(ticket.Cart, ticket.EmployeeID, ticket.ReceiptDate, ticket.ReceiptTime, ticket.ReceiptTill)}
                                    className={`w-400 flex flex-row justify-between text-center p-2 rounded 
                                ${theme === "Dark"
                                            ? "  border border-blue-800  "
                                            : "bg-white hover:bg-blue-200 "
                                        }`}
                                >
                                    <p className=" text-sm">{ticket.Name}</p>

                                    <div className="flex flex-row justify-around ">
                                        <a
                                            className={`py-1 px-3 mx-2 rounded
                                            ${theme === "Dark"
                                                    ? "text-white  bg-blue-800  hover:bg-blue-600   "
                                                    : "bg-blue-600 text-white   hover:bg-blue-800"
                                                }`}
                                            onClick={() => setReceiptModal(true)}
                                        >
                                            Receipt
                                        </a>

                                    </div>

                                </button>
                            ))}

                            {!filteredTickets &&
                                <div>
                                    <div className=" justify-center flex mt-20">
                                        <FaTicketAlt className={` text-4xl 
                                       ${theme === "Dark"
                                                ? " text-white"
                                                : " text-black "
                                            }`
                                        }
                                        />
                                    </div>
                                    <div className=" justify-center flex">

                                        <h1 className="text-xl mt-2">
                                            Choose Employee / No Ticket
                                        </h1>
                                    </div>
                                </div>
                            }


                        </div>
                    </aside>

                    {/* Item List */}

                    <section className="w-full h-screen flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold m-5">Items </h3>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 overflow-y-auto ">
                            <table className="min-w-full table-auto shadow-lg rounded">
                                <thead className={` top-0
                             ${theme === "Dark"
                                        ? "bg-blue-800 "
                                        : " bg-blue-600 text-white "
                                    }`}>
                                    <tr>
                                        <th className={`border py-1 text-md 
                                       ${theme === "Dark"
                                                ? "border-blue-800 "
                                                : "border-gray-300 "
                                            }`}>#</th>
                                        <th className={`border py-1 text-md 
                                       ${theme === "Dark"
                                                ? "border-blue-800 "
                                                : "border-gray-300 "
                                            }`}>Item</th>
                                        <th className={`border py-1 text-md 
                                       ${theme === "Dark"
                                                ? "border-blue-800 "
                                                : "border-gray-300 "
                                            }`}>Unit</th>
                                        <th className={`border py-1 text-md 
                                       ${theme === "Dark"
                                                ? "border-blue-800 "
                                                : "border-gray-300 "
                                            }`}>Price</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {cart && cart
                                        .filter((item) => item.Name.toLowerCase().includes(searchQuery.toLowerCase())) // Filter items by search query
                                        .map((item, index) => (
                                            <tr key={item.id} className={`text-sm  

                                         ${theme === "Dark"
                                                    ? " hover:bg-blue-100 hover:text-black"
                                                    : " bg-white border border-gray-300 hover:bg-blue-100 "
                                                }`}>
                                                <td className={`px-4 py-2 text-center
                                              ${theme === "Dark"
                                                        ? "border-blue-800 "
                                                        : "border-gray-300 border"
                                                    }`} >{index + 1}</td>
                                                <td className={`px-4 py-2 text-center
                                               ${theme === "Dark"
                                                        ? "border-blue-800 "
                                                        : "border-gray-300 border"
                                                    }`}>{item.Name}</td>
                                                <td className={`px-4 py-2 text-center
                                               ${theme === "Dark"
                                                        ? "border-blue-800 "
                                                        : "border-gray-300 border"
                                                    }`}>{item.stock}</td>
                                                <td className={`px-4 py-2 text-center
                                               ${theme === "Dark"
                                                        ? "border-blue-800 "
                                                        : "border-gray-300 border"
                                                    }`}>{item.Price}</td>

                                            </tr>
                                        ))}
                                </tbody>
                            </table>

                            <div className="mt-4 font-bold text-lg mx-20">
                                Total: Ksh {total.toFixed(2)}
                            </div>
                        </div>
                    </section>
                </div>

            )}



            {/*receipt Modal */}
            {receiptModal1 && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className="bg-white p-6 rounded shadow w-96" >
                        <h2 className="text-lg font-bold mb-4">Print Receipt</h2>

                        {cart.map((item, index) => (
                            <div
                                key={index}
                                className=" flex justify-between items-center p-2 bg-white shadow rounded mb-2 text-sm mt-3"
                            >
                                <div className="w-1/10 text-center">{item.stock}</div>
                                <div className="w-2/5 text-center">{item.Name}</div>
                                <div className="w-1/5 text-center">Ksh {item.Price}</div>

                            </div>
                        ))}


                        <div className="mt-4 font-bold text-lg">
                            Total: Ksh {total.toFixed(2)}

                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={() => window.print()}
                            >
                                print
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={receiptModalFun}
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {receiptModal && (
                <div className="w-full flex items-center justify-center bg-black bg-opacity-10 overflow-y-auto">

                    <div
                        className={`p-4  shadow w-[380px] font-sans text-sm  print-area receipt-container
        ${theme === "Dark" ? "bg-white text-black" : "bg-white text-black"}
      `}
                    >
                        <div className="text-center text-2xl font-bold">
                            <p className="text-lg font-extrabold tracking-tight uppercase font-sans">
                                DASHAMA WHOLESALERS
                            </p>
                            <p className="font-semibold text-xs">P.O.BOX: 207, MARAGOLI-KENYA.</p>
                            <p className="font-semibold text-xs">TEL: 0723-679389</p>
                            <p className="font-semibold text-xs">VAT #: A002691181T | PIN  #: A002691181T</p>
                        </div>

                        {/* Paybill Section with background */}
                        <div className="print-bg bg-black text-white text-4xl py-1 text-center font-bold">
                            PAYBILL: 157424
                        </div>

                        <div className="border-t border-dotted border-black/20 mt-1"></div>

                        {/* Cash Sale Header */}

                        <div className="text-center font-bold text-2xl mb-2">CASH SALE</div>
                        <div className="border-t border-dotted border-black/20"></div>
                        <div className="flex justify-between mb-2 font-bold">
                            <div>
                                <p className="text-sm  ">Till No: {selectedTill}</p>
                                <p className="text-sm ">M/S: {selectedCashier}</p>
                                <p className="text-sm ">PIN:</p>
                            </div>
                            <div>
                                <p className="text-sm">Cash Sale #: MRCS644162</p>
                            </div>

                        </div>
                        <div className="border-t border-dotted border-black/20"></div>

                        <div className="flex justify-between mb-1">
                            <p className="text-sm">Date: {selectedDate}</p>
                            <p className="text-sm ">Time:<span className="text-xs mx-3"> {selectedTime}</span></p>
                        </div>
                        <div className="border-t border-dotted border-black/20"></div>
                        <div >
                            <div className="flex justify-between font-bold text-sm">
                                <div className="w-1/2">ITEM</div>
                                <div className="grid grid-cols-2 gap-4 w-40 text-right">
                                    <span>PRICE</span>
                                    <span>AMOUNT</span>
                                </div>
                            </div>
                            <div className="border-t border-dotted border-black/20"></div>

                            <div className="bg-white text-black">
                                {cart.map((item, i) => (
                                    <div key={i} className="py-1">
                                        <div className="flex justify-between font-bold">
                                            <div className="font-sm">{item.Name}</div>
                                            <div className="text-xs">A</div>
                                        </div>
                                        <div className="flex justify-between">
                                            <div className="text-xs" >
                                                {item.Code}
                                                <span className="ml-8 text-sm ">
                                                    {parseFloat(item.stock).toFixed(2)}  ({item.Unit})
                                                </span>
                                            </div>
                                            <div >
                                                <div className="grid grid-cols-2 gap-4 w-40 text-right">

                                                    <span>{item.Price.toLocaleString()}</span>
                                                    <span>{(parseInt(item.stock) * parseInt(item.Price)).toLocaleString()}</span>

                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-t border-dotted border-black/20"></div>
                                    </div>

                                ))}
                            </div>

                            <div className="border-t border-dotted border-black/20"></div>

                            <div className=" my-2" />
                            <div className="flex justify-between font-bold text-lg">
                                <span>TOTAL:</span>
                                <span>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>CASH:</span>
                                <span>{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>CHANGE:</span>
                                <span>0.00</span>
                            </div>
                        </div>
                        <div className="border-t border-dotted border-black/20"></div>

                        {/* Footer Summary */}
                        <div className="text-xs space-y-1">
                            <p className="flex items-center font-bold">
                                <strong className="flex-1">TOTAL ITEMS:</strong>
                                <span className="text-center w-40 mr-7">{totalItems}</span>
                            </p>
                            <div className="border-t border-dotted border-black/20"></div>
                            <p className="flex items-center font-bold">
                                <strong className="flex-1">TOTAL QTY:</strong>
                                <span className="text-center w-40 mr-7">{totalQty}</span>
                            </p>
                            <div className="border-t border-dotted border-black/20"></div>
                            <p className="flex items-center font-bold">
                                <strong className="flex-1">TOTAL WEIGHT:</strong>
                                <span className="text-center w-40 mr-7">{format(totalWeight)}</span>
                            </p>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="border-t border-dotted border-black/20"></div>

                            {/* VAT Breakdown */}
                            <div className="mt-2">
                                <div className="grid grid-cols-4 text-xs mr-6">
                                    <p className="col-span-1 underline text-left"><strong>CODE</strong></p>
                                    <p className="col-span-1 underline text-right"><strong>VATABLE AMT</strong></p>
                                    <p className="col-span-1 underline text-right"><strong>VAT AMT</strong></p>
                                    <p className="col-span-1 underline text-right"><strong>TOTAL</strong></p>

                                    {['A', 'E', 'Z'].map(code => (
                                        <React.Fragment key={code}>
                                            <p className="col-span-1 text-left font-bold">{code}</p>
                                            <p className="col-span-1 text-right font-bold">{format(vatBreakdown[code].vatable - vatBreakdown[code].vat)}</p>
                                            <p className="col-span-1 text-right font-bold">{format(vatBreakdown[code].vat)}</p>
                                            <p className="col-span-1 text-right font-bold">
                                                {format(vatBreakdown[code].vatable)}
                                            </p>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-dotted border-black/20"></div>
                            <p className="mt-2 font-semibold">VAT CODE:(A)=VATABLE, (E)=EXEMPT, (Z)=ZERO RATED</p>
                            <p className="font-semibold">PRICES INCLUSIVE OF VAT WHERE APPLICABLE</p>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <p className="font-bold">YOU WERE SERVED BY : TILL {selectedTill}</p>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="text-xm text-center font-bold">
                                <p>GOODS ONCE SOLD CANNOT BE ACCEPTED</p>
                                <p>BACK FOR REFUND OR ANY OTHER REASON</p>
                            </div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="border-t border-dotted border-black/20"></div>
                            <div className="border-t border-dotted border-black/20"></div>

                            {/* QR Code Placeholder */}
                            <div className="flex justify-center my-3">
                                <QRCodeSVG
                                    value={JSON.stringify({
                                        invoice: '011039102000356913',
                                        totalItems: totalItems,
                                        totalQty: totalQty,
                                        totalWeight: totalWeight.toFixed(2),
                                        totalVAT: vatBreakdown.A.vat.toFixed(2),
                                        totalAmount: (vatBreakdown.A.vatable + vatBreakdown.A.vat).toFixed(2),
                                    })}
                                    size={96}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                    className="border border-gray-400"
                                />
                            </div>


                            <p className="font-semibold">CU SN: KRAMW011202260839102</p>
                            <div className="border-t border-black mb-2"></div>
                            <p className="font-semibold">CU INV: 011039102000356913</p>
                        </div>


                        <div className="text-xs text-center font-semibold">
                            <p >Thank You......Come Again.</p>
                        </div>

                        <div className=" no-print flex flex-row justify-evenly mt-4">
                            <button
                                className={`text-white px-4 py-2 rounded 
            ${theme === "Dark" ? "bg-green-800 hover:bg-green-600" : "bg-green-600 hover:bg-green-800"}`}
                                onClick={() => window.print()}
                            >
                                Print
                            </button>
                            <button
                                className={`text-white px-4 py-2 rounded 
            ${theme === "Dark" ? "bg-red-800 hover:bg-red-600" : "bg-red-600 hover:bg-red-800"}`}
                                onClick={receiptModalFun}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}




            {/* send Modal */}
            {sendModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Confirm Order </h2>

                        <div className="mt-4 font-bold text-lg">
                            Total: Ksh{total.toFixed(2)}
                        </div>
                        <div className="mt-4">

                            <p className="font-semibold"> Select Employee</p>

                            <select
                                className="border p-2 rounded mt-1 text-black"
                                value={selectEmployee}
                                onChange={(e) => setSelectEmployee(e.target.value)}
                            >
                                <option value="" disabled className="font-light">
                                    -- Select the Cashier --
                                </option>
                                {employees &&
                                    employees.map((employee) => (
                                        <option key={employee.id} value={employee.Name}>
                                            {employee.Name}
                                        </option>
                                    ))}
                            </select>

                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={handleSend}
                            >
                                Send
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={sendModalFun}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Auto-Close Modals */}
            {sendModalSuccess && (
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
                        <p>The Ticket was cleared</p>
                    </div>
                </div>
            )}

            {sendModalFail && (
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
                        <p>The ticket was not cleared</p>
                    </div>
                </div>
            )}

            {sendModalFailEmployee && (
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
                        <p>Did not choose an Employee</p>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Ticket