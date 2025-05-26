"use client"
import React, { useState } from "react";
import { ref, push, update } from 'firebase/database';
import { MdEmail } from "react-icons/md"
import { db, } from "../../../config";
import { FaUser, FaTerminal, FaClock, FaBox, FaList, FaFile, FaEject, FaProductHunt, FaBoxOpen, FaExpand, FaFolder, FaTags } from "react-icons/fa";
import { useUserCategories } from "@/app/componets/zustand/categories";
import { useUserID } from "@/app/componets/zustand/profile";
import { useUserItems, useUserItemsData } from "@/app/componets/zustand/items";
import { useUserEmployee } from "@/app/componets/zustand/employees";
import itemsdata from "@/app/data/items";
import categoriesdata from "@/app/data/categories";
import { useUserTheme } from "@/app/componets/zustand/theme";
import { TbXboxX } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import { QRCodeSVG } from 'qrcode.react';
import { useUserCartReceipt, useUserCartTotalReceipt } from "@/app/componets/zustand/receipt";
import { FaCashRegister } from "react-icons/fa";


const Dashboard = () => {



  //// Zustand 
  const Id = useUserID((state) => state.userID)
  const categories = useUserCategories((state) => state.userCategories)
  const items = useUserItems((state) => state.userItems)

  const employees = useUserEmployee((state) => state.userEmployee)

  const theme = useUserTheme((state) => state.userTheme)

  // State to track the selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  /////// Select box   mostly for employees
  const [selectEmployee, setSelectEmployee] = useState("");
  const [ticketName, setTicketName] = useState('');



  const selectCat = (catname) => {
    if (catname == selectedCategory) {
      setSelectedCategory(null)

    }
    else {
      setSelectedCategory(catname)
    }

  }

  // Filter items based on selected category
  const filteredItems = selectedCategory
    ? items.filter((item) => {
      return item.Category === selectedCategory
    })
    : items;

  ///// Modals
  const [ticketModal, setTicketModal] = useState(false)
  const [receiptDetailsModal, setreceiptDetailsModal] = useState(false)
  const [sendModal, setSendModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);

  const receiptModalFun = () => setReceiptModal(false);

  const sendModalFun = () => {
    setSelectEmployee("")
    setTicketName('')
    setSelectedDate('')
    setSelectedTime('')
    setSelectedTill('')
    setSendModal(false);
  }

  const ticketModalFun = () => {
    setTicketName('')
    setSelectEmployee("")

    setTicketModal(false);
  }



  const receiptDetailsModalFun = () => {
    setReceiptName('')


    setreceiptDetailsModal(false);
  }

  /////receipt details modal 
  const [receiptName, setReceiptName] = useState('');
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // initialize like this
  const [selectedTill, setSelectedTill] = useState("");

  const receiptDetailsClose = () => {
    setReceiptModal(true);

    setreceiptDetailsModal(false)
  }


  // const cart = useUserCartReceipt((state) => state.userCartReceipt)

  /// Cart functions 
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);


  const addToCart = (item) => {


    if (item.Stock > 0) {
      const existingItem = cart.find((cartItem) => cartItem.Name === item.Name);

      // Check if the stock in cart has reached the store stock
      const stockCheck = existingItem ? existingItem.stock >= item.Stock : false;

      if (existingItem) {
        if (stockCheck) {
          itemMaxFun();
        } else {
          setCart(
            cart.map((cartItem) =>
              cartItem.Name === item.Name
                ? { ...cartItem, stock: cartItem.stock + 1 }
                : cartItem
            )
          );

          setTotal(total + parseFloat(item.Price));

        }
      } else {
        setCart([...cart, { ...item, stock: 1 }]);

        setTotal(total + parseFloat(item.Price));

      }

    } else {
      itemOutStockFun();
    }
  };

  const handleIncrease = (item) => {

    if (item.stock >= item.Stock) {

      itemMaxFun();
    }
    else {
      setCart(
        cart.map((cartItem) =>
          cartItem.Name === item.Name
            ? { ...cartItem, stock: cartItem.stock + 1 }
            : cartItem
        )
      );



      setTotal(total + parseFloat(item.Price));

    }

  };

  const handleDecrease = (item) => {
    if (item.stock > 1) {
      setCart(
        cart.map((cartItem) =>
          cartItem.Name === item.Name
            ? { ...cartItem, stock: cartItem.stock - 1 }
            : cartItem
        )
      );



      setTotal(total - parseFloat(item.Price));

    } else {
      handleRemove(item);
    }
  };

  const handleRemove = (item) => {
    setCart(cart.filter((cartItem) => cartItem.Name !== item.Name));


    setTotal(total - parseFloat(item.Price) * item.stock);


  };


  ///ticket function 
  const handleticket = () => {

    if (Id) {

      if (selectEmployee && cart && ticketName) {
        if (total == 0) {

          console.log("total is zero")
          ticketfailTotal()
        }

        else {
          try {
            const dbRef = ref(db, `web/pos/${Id}/ticket/`);

            const newbranchRef = push(dbRef, {

              Name: ticketName,
              EmployeeID: selectEmployee,
              Cart: cart,
              Total: total,
              Date: Date.now()

            });
            const newCreditKey = newbranchRef.key;

            ticketModalFun()
            handleCancel()
            ticketSuccess()
            updateStockInDatabase();

          }
          catch {
            console.log("did not send to DB")
            ticketModalFun()
            ticketFail()
          }
        }
      }

      else {

        console.log("did not select employee ")
        ticketModalFun()
        ticketFailEmployee()
      }
    }


  };


  const generateRandomHex = () => {
    const chars = '0123456789ABCDEF';
    let hex = '';
    for (let i = 0; i < 6; i++) {
      hex += chars[Math.floor(Math.random() * chars.length)];
    }
    return hex;
  };



  //// send cart to the database 
  const handleSend = () => {

    if (Id) {

      if (selectEmployee && cart) {
        if (total == 0) {

          console.log("total is zero")
          sendFailTotal()
        }

        else {
          try {
            const hexTicket = generateRandomHex();

            const dbRef = ref(db, `web/pos/${Id}/cart/`);

            const newbranchRef = push(dbRef, {

              EmployeeID: selectEmployee,
              Name: hexTicket,
              Cart: cart,
              Total: total,
              Date: Date.now(),
              ReceiptDate: selectedDate,
              ReceiptTime: selectedTime,
              ReceiptTill: selectedTill,

            });
            const newCreditKey = newbranchRef.key;

            sendModalFun()
            handleCancel()
            sendSuccess()
            updateStockInDatabase(Id);
          }
          catch (error) {
            console.log(error)
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

  const handleCancel = () => {
    setCart([]);
    useUserCartReceipt.setState({ userCartReceipt: [] })
    setTotal(0);
    useUserCartTotalReceipt.setState({ userCartTotalReceipt: 0 })
  };


  /// Update stock
  const updateStockInDatabase = async (id) => {
    try {
      const updates = {};
      cart.forEach((cartItem) => {
        updates[`web/pos/${id}/items/${cartItem.id}/Stock`] = cartItem.Stock - cartItem.stock; // Update stock in the database
      });
      await update(ref(db), updates);
      console.log("Stock updated successfully");
    } catch (error) {
      console.error("Error updating stock:", error);
    }
  };


  ////  Auto close modals
  const [sendModalSuccess, setSendModalSuccess] = useState(false);
  const [sendModalFail, setSendModalFail] = useState(false);
  const [sendModalFailEmployee, setSendModalFailEmployee] = useState(false);
  const [sendModalFailTotal, setSendModalFailTotal] = useState(false);

  const sendSuccess = () => {
    setSendModalSuccess(true);
    setTimeout(() => setSendModalSuccess(false), 1500);
  };

  const sendFail = () => {
    setSendModalFail(true);
    setTimeout(() => setSendModalFail(false), 1500);
  };

  const sendFailTotal = () => {
    setSendModalFailTotal(true);
    setTimeout(() => setSendModalFailTotal(false), 1500);
  };

  const sendFailEmployee = () => {
    setSendModalFailEmployee(true);
    setTimeout(() => setSendModalFailEmployee(false), 1500);
  };


  const [ticketModalSuccess, setTicketModalSuccess] = useState(false);
  const [ticketModalFail, setTicketModalFail] = useState(false);
  const [ticketModalFailEmployee, setTicketModalFailEmployee] = useState(false);
  const [ticketModalFailTotal, setTicketModalFailTotal] = useState(false);

  const ticketSuccess = () => {
    setTicketModalSuccess(true);
    setTimeout(() => setTicketModalSuccess(false), 1500);
  };

  const ticketFail = () => {
    setTicketModalFail(true);
    setTimeout(() => setTicketModalFail(false), 1500);
  };

  const ticketfailTotal = () => {
    setTicketModalFailTotal(true);
    setTimeout(() => setTicketModalFailTotal(false), 1500);
  };

  const ticketFailEmployee = () => {
    setTicketModalFailEmployee(true);
    setTimeout(() => setTicketModalFailEmployee(false), 1500);
  };



  const [itemMaxFail, setItemMaxModalFail] = useState(false);
  const [ItemOutStockFail, setItemOutStockModalFail] = useState(false);


  const itemMaxFun = () => {
    setItemMaxModalFail(true);
    setTimeout(() => setItemMaxModalFail(false), 1000);
  };

  const itemOutStockFun = () => {
    setItemOutStockModalFail(true);
    setTimeout(() => setItemOutStockModalFail(false), 1000);
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

    <div className={`min-h-screen flex flex-col"
    ${theme === "Dark"
        ? "text-white "
        : "bg-gray-200 text-black rounded-lg"
      }`}
    >

      {/* Main Layout */}

      {!receiptModal && (
        <div className="flex flex-col md:flex-row flex-grow rounded">

          {/* Sidebar */}
          <aside className="hidden sm:block w-full md:w-1/4 p-4 rounded-lg shadow-xl border-b md:border-b-0 md:border-r">

            <h3 className="text-lg font-bold mb-4 text-center ">
              Categories</h3>

            <div className="grid grid-cols-1 gap-2 px-10 pt-2 overflow-y-auto "

            >
              {categories && categories.map((category, index) => (
                <button
                  key={index}
                  className={`w-50 p-5  rounded-xl
                 ${theme === "Dark"
                      ? "text-white border border-blue-800  hover:bg-blue-600 "
                      : "bg-blue-600 text-white  hover:bg-blue-400 "
                    }`}

                  onClick={() => selectCat(category.Name)}
                >
                  {category.Name}
                </button>
              ))}

              {!categories &&
                <div>
                  <div className=" justify-center flex mt-20">
                    <FaTags className={` text-3xl 
                   ${theme === "Dark"
                        ? " text-white"
                        : " text-black "
                      }`
                    }
                    />
                  </div>
                  <div className=" justify-center flex">

                    <h1 className="text-lg mt-2">
                      No Categories Added
                    </h1>
                  </div>
                </div>
              }
            </div>
          </aside>

          {/* Items */}
          <section className="w-full md:w-2/4 p-4 rounded-lg">


            <h3 className="text-lg font-bold mb-4 ">Items</h3>

            {filteredItems &&

              <div className="grid grid-cols-4 gap-1 overflow-y-auto "

              >
                {filteredItems && filteredItems.map((item, index) => (
                  <button
                    key={index}
                    className={`p-5  shadow  rounded-lg text-sm mr-1
                     ${theme === "Dark"
                        ? "text-white  bg-[#132962]   hover:bg-blue-800 "
                        : "bg-green-600 text-white  hover:bg-green-400 "
                      }`}

                    onClick={() => addToCart(item)}
                  >
                    <p>{item.Name}</p>
                    <p>Ksh {item.Price} /=</p>
                    <p>Stock:{item.Stock}</p>
                  </button>
                ))}
              </div>
            }

            {!filteredItems &&
              <div >
                <div className=" justify-center flex mt-20">
                  <FaBoxOpen className={`  text-4xl 
                 ${theme === "Dark"
                      ? " text-white"
                      : " text-black "
                    }`
                  } />
                </div>
                <div className=" justify-center flex">

                  <h1 className="text-xl mt-2">
                    No Items in the Inventory
                  </h1>
                </div>
              </div>
            }
          </section>

          {/* Cart */}
          <section className={`w-full md:w-1/4 p-4 border-t md:border-t-0 md:border-l  rounded-lg
          ${theme === "Dark"
              ? "text-white   "
              : "bg-gray-300  "
            }`}
          >
            <h3 className="text-lg font-bold mb-4">Cart</h3>
            <div className={`flex justify-between font-bold p-2 rounded mb-2 text-sm 
            ${theme === "Dark"
                ? "text-white bg-blue-800  "
                : "bg-blue-600 shadow text-white "
              }`}
            >
              <div className="w-1/10 text-center">Unit</div>
              <div className="w-2/5 text-center">Name</div>
              <div className="w-1/5 text-center">Price</div>
              <div className="w-1/5 text-center">Actions</div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className={` flex justify-between items-center p-2  rounded-md mb-2 text-sm
                ${theme === "Dark"
                      ? "text-white "
                      : "bg-white shadow-md "
                    }`}
                >
                  <div className="w-1/10 text-center">{item.stock}</div>
                  <div className="w-2/5 text-center">{item.Name}</div>
                  <div className="w-1/5 text-center">{(parseInt(item.stock) * parseInt(item.Price)).toLocaleString()}</div>
                  <div className="w-3/10 flex justify-between">
                    <button
                      className={` py-1 px-2  rounded  
                      ${theme === "Dark"
                          ? "text-white  bg-green-800  hover:bg-green-600   "
                          : "bg-green-600 text-white   hover:bg-green-800"
                        }`}
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>
                    <button
                      className={` py-1 px-2 mx-1 rounded
                         ${theme === "Dark"
                          ? "text-white  bg-blue-800  hover:bg-blue-600   "
                          : "bg-yellow-400 hover:bg-yellow-700 text-black "
                        }`}
                      onClick={() => handleDecrease(item)}
                    >
                      -
                    </button>
                    <button
                      className={`py-1 px-2 rounded 
                       ${theme === "Dark"
                          ? "text-white  bg-red-800  hover:bg-red-600 "
                          : "bg-red-600 text-white  hover:bg-red-800  "
                        }`}

                      onClick={() => handleRemove(item)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 font-bold text-lg">
              Total: Ksh {total.toFixed(2)}
            </div>


            <div className="flex justify-around mt-4">
              <button
                className={`py-2 px-4 mt-4 rounded 
                 ${theme === "Dark"
                    ? "text-white  bg-blue-800  hover:bg-blue-600   "
                    : "bg-blue-600 text-white   hover:bg-blue-800 shadow-lg"
                  }`}
                onClick={() => setreceiptDetailsModal(true)}
              >
                Receipt
              </button>
              <button
                className={` py-2 px-4 mt-4 rounded 
                  ${theme === "Dark"
                    ? "text-white  bg-green-800  hover:bg-green-600   "
                    : "bg-green-600 text-white   hover:bg-green-800 shadow-lg"
                  }`}
                onClick={() => setSendModal(true)}
              >
                Send
              </button>
              <button
                className={` py-2 px-4 mt-4 rounded 
                  ${theme === "Dark"
                    ? "text-white  bg-red-800  hover:bg-red-600 "
                    : "bg-red-600 text-white  hover:bg-red-800 shadow-lg "
                  }`}

                onClick={() => handleCancel()}
              >
                Cancel
              </button>
            </div>
          </section>

        </div>
      )}
      {/* ticket Modal */}
      {ticketModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
              ? " bg-[#171941] "
              : " bg-white "
            }`
          }>
            <h2 className="text-lg font-bold mb-4 text-center">Give Ticket </h2>

            <div className="mt-4  font-bold text-lg">
              Total: Ksh {total.toFixed(2)}
            </div>

            <div className="relative my-2">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                style={{ color: "#000000" }}
                value={ticketName}
                onChange={(e) => setTicketName(e.target.value)}
              />
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
            </div>
            <div className="mt-4">

              <p className="font-semibold"> Select Cashier</p>

              <select
                className="border p-2 rounded mt-1 text-black"
                value={selectEmployee}
                onChange={(e) => setSelectEmployee(e.target.value)}
              >
                <option value="" disabled>
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
                onClick={handleticket}
              >
                Give Ticket
              </button>
              <button
                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                    ? "bg-red-800  hover:bg-red-600"
                    : "bg-red-600  hover:bg-red-800 "
                  }`}
                onClick={ticketModalFun}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}


      {/* receipt details Modal */}
      {receiptDetailsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div
            className={`p-6 rounded-xl shadow w-96 ${theme === "Dark" ? "bg-[#171941]" : "bg-white"
              }`}
          >
            <h2 className="text-lg font-bold mb-4 text-center">
              Enter Receipt details
            </h2>

            <div className="mt-4 font-bold text-lg">
              Total: Ksh {total.toFixed(2)}
            </div>

            <div className="mt-4">

              <p className="font-semibold"> Select Cashier</p>

              <select
                className="border p-2 rounded mt-1 text-black"
                value={selectEmployee}
                onChange={(e) => setSelectEmployee(e.target.value)}
              >
                <option value="" disabled>
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

            <div className="relative my-2">
              <input
                type="number"
                placeholder="Select_Till"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] pl-12 shadow-md"
                style={{ color: "#000000" }}
                value={selectedTill}
                onChange={(e) => setSelectedTill(e.target.value)}
              />
              <FaCashRegister className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
            </div>

            {/* DATE PICKER BOX */}
            <div className="relative my-2">
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] shadow-md"
                style={{ color: "#000000" }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* TIME PICKER BOX */}
            <div className="relative my-2">
              <input
                type="time"
                step="1" // 👈 This enables hours:minutes:seconds
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] shadow-md"
                style={{ color: "#000000" }}
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />

            </div>

            <div className="flex flex-row justify-evenly">
              <button
                className={`text-white px-4 py-2 rounded mt-4 ${theme === "Dark"
                  ? "bg-green-800 hover:bg-green-600"
                  : "bg-green-600 hover:bg-green-800"
                  }`}
                onClick={receiptDetailsClose}
              >
                View Receipt
              </button>
              <button
                className={`text-white px-4 py-2 rounded mt-4 ${theme === "Dark"
                  ? "bg-red-800 hover:bg-red-600"
                  : "bg-red-600 hover:bg-red-800"
                  }`}
                onClick={receiptDetailsModalFun}
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
                <p className="text-sm ">M/S: {selectEmployee}</p>
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
              Total: Ksh {total.toFixed(2)}
            </div>
            <div className="mt-4">

              <p className="font-semibold"> Select Cashier</p>

              <select
                className="border p-2 rounded mt-1 text-black"
                value={selectEmployee}
                onChange={(e) => setSelectEmployee(e.target.value)}
              >
                <option value="" disabled>
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



            <div className="relative my-2">
              <input
                type="number"
                placeholder="Select_Till"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] pl-12 shadow-md"
                style={{ color: "#000000" }}
                value={selectedTill}
                onChange={(e) => setSelectedTill(e.target.value)}
              />
              <FaCashRegister className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
            </div>

            {/* DATE PICKER BOX */}
            <div className="relative my-2">
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] shadow-md"
                style={{ color: "#000000" }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            {/* TIME PICKER BOX */}
            <div className="relative my-2">
              <input
                type="time"
                step="1" // 👈 This enables hours:minutes:seconds
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#303133] shadow-md"
                style={{ color: "#000000" }}
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
              />

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
            <p>The Items were sold</p>
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
            <p>The items were not sold</p>
          </div>
        </div>
      )}

      {sendModalFailTotal && (
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
            <p>The Cart is Empty</p>
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

      {/* Auto-Close Modals */}
      {ticketModalSuccess && (
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
            <p>The Ticket was created</p>
          </div>
        </div>
      )}

      {ticketModalFail && (
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
            <p>The ticket was not created</p>
          </div>
        </div>
      )}

      {ticketModalFailTotal && (
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
            <p>The cart is Empty</p>
          </div>
        </div>
      )}

      {ticketModalFailEmployee && (
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

      {itemMaxFail && (
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
            <p>The Maximum Stock of Item </p>
          </div>
        </div>
      )}

      {ItemOutStockFail && (
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
            <p>Item is Out of Stock </p>
          </div>
        </div>
      )}

    </div>

  )
}

export default Dashboard

