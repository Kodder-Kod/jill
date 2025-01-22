"use client"
import { useState } from "react";
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
  const [sendModal, setSendModal] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);

  const receiptModalFun = () => setReceiptModal(false);
  const sendModalFun = () => {
    setSelectEmployee("")

    setSendModal(false);
  }

  const ticketModalFun = () => {
    setTicketName('')
    setSelectEmployee("")

    setTicketModal(false);
  }


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
  };


  //// send cart to the database 
  const handleSend = () => {

    if (selectEmployee && cart) {
      if (total == 0) {

        console.log("total is zero")
        sendFailTotal()
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
          handleCancel()
          sendSuccess()
          updateStockInDatabase();
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
  };

  const handleCancel = () => {
    setCart([]);
    setTotal(0);
  };


  /// Update stock
  const updateStockInDatabase = async () => {
    try {
      const updates = {};
      cart.forEach((cartItem) => {
        updates[`web/pos/${Id}/items/${cartItem.id}/Stock`] = cartItem.Stock - cartItem.stock; // Update stock in the database
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




  return (

    <div className={`min-h-screen flex flex-col"
    ${theme === "Dark"
        ? "text-white "
        : "bg-gray-200 text-black rounded-lg"
      }`}
    >

      {/* Main Layout */}
      <div className="flex  flex-grow rounded">
        {/* Sidebar */}
        <aside className="w-96  p-4 rounded shadow-xl border-r"

        >
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
        <section className="w-2/3 p-4"
        >
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
        <section className={`w-1/3  p-4 border-l 
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
                <div className="w-1/5 text-center">{item.Price}</div>
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
                  : "bg-blue-600 text-white   hover:bg-blue-800"
                }`}
              onClick={() => setReceiptModal(true)}
            >
              Receipt
            </button>
            <button
              className={`py-2 px-4 mt-4 rounded 
               ${theme === "Dark"
                  ? "text-white  bg-blue-800  hover:bg-blue-600   "
                  : "bg-yellow-400 hover:bg-yellow-700 text-black"
                }`}
              onClick={() => setTicketModal(true)}
            >
              Ticket
            </button>
            <button
              className={` py-2 px-4 mt-4 rounded 
                  ${theme === "Dark"
                  ? "text-white  bg-green-800  hover:bg-green-600   "
                  : "bg-green-600 text-white   hover:bg-green-800"
                }`}
              onClick={() => setSendModal(true)}
            >
              Send
            </button>
            <button
              className={` py-2 px-4 mt-4 rounded 
                  ${theme === "Dark"
                  ? "text-white  bg-red-800  hover:bg-red-600 "
                  : "bg-red-600 text-white  hover:bg-red-800  "
                }`}

              onClick={() => handleCancel()}
            >
              Cancel
            </button>
          </div>
        </section>

      </div>

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



      {/*receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
              ? " bg-[#171941] "
              : " bg-white "
            }`
          } >
            <h2 className="text-lg font-bold mb-4">Print Receipt</h2>

            {cart.map((item, index) => (
              <div
                key={index}
                className=" flex justify-between items-center p-2 bg-white shadow rounded mb-2 text-sm mt-3 text-black"
              >
                <div className="w-1/10 text-center">{item.stock}</div>
                <div className="w-2/5 text-center">{item.Name}</div>
                <div className="w-1/5 text-center">{item.Price}</div>

              </div>
            ))}

            <div className="mt-4 font-bold text-lg">
              Total: Ksh{total.toFixed(2)}
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

