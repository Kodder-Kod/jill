"use client"


import { ref, update, push, remove } from 'firebase/database';
import { db } from "../../../config";
import { MdEmail } from "react-icons/md"
import { GiPadlock } from "react-icons/gi";
import { GiDialPadlock } from "react-icons/gi";
import { FaBoxOpen, FaBox, FaDollarSign, FaPhoneAlt, FaSearch, FaTag, FaTags } from "react-icons/fa";
import { useEffect, useState } from "react";
import { FaUser, FaTerminal, FaClock } from "react-icons/fa";
import { useUserItems, useUserItemsTotal } from '@/app/componets/zustand/items';
import { useUserCategories, useUserCategoriesTotal } from '@/app/componets/zustand/categories';
import { useUserID } from '@/app/componets/zustand/profile';
import { TbXboxX } from "react-icons/tb";
import { TiTick } from "react-icons/ti";
import itemsdata from "@/app/data/items";
import categoriesdata from "@/app/data/categories";
import { useUserTheme } from '@/app/componets/zustand/theme';
import { CiBarcode } from "react-icons/ci";
import { CgCommunity } from "react-icons/cg";




const Inventory = () => {

    // Zustand
    const Id = useUserID((state) => state.userID)
    const categories = useUserCategories((state) => state.userCategories)
    const categoriesTotal = useUserCategoriesTotal((state) => state.userCategoriesTotal)
    const items = useUserItems((state) => state.userItems)
    const itemsTotal = useUserItemsTotal((state) => state.userItemsTotal)
    const theme = useUserTheme((state) => state.userTheme)




    ///General variables
    const [searchQuery, setSearchQuery] = useState("");

    /// Modals
    // Add 
    const [itemName, setItemName] = useState('')
    const [itemPrice, setItemPrice] = useState('')
    const [itemUnit, setItemUnit] = useState('')
    const [itemCode, setItemCode] = useState('')
    const [itemStock, setItemStock] = useState('')
    const [ItemCategory, setItemCategory] = useState('')

    const [catName, setCatName] = useState('')


    const [itemModal, setItemModal] = useState(false)
    const [catModal, setCatModal] = useState(false);

    const itemModalFun = () => {
        setItemName('')
        setItemPrice('')
        setItemStock('')
        setItemCode('')
        setItemUnit('')
        setItemCategory('')
        setItemModal(false)
    }
    const catModalFun = () => {
        setCatName('')
        setCatModal(false);
    }

    const itemModalFunBtn = () => setItemModal(true)
    const catModalFunBtn = () => setCatModal(true);


    /// Edit
    const [itemModalEdit, setItemModalEdit] = useState(false)
    const [catModalEdit, setCatModalEdit] = useState(false);

    const itemModalFunEdit = () => {
        setItemName('')
        setItemPrice('')
        setItemStock('')
        setItemCode('')
        setItemUnit('')
        setItemCategory('')
        setItemModalEdit(false)
    }
    const catModalFunEdit = () => {
        setCatName('')
        setCatModalEdit(false);
    }

    const itemModalFunBtnEdit = () => setItemModalEdit(true)
    const catModalFunBtnEdit = () => setCatModalEdit(true);

    //// Delete 
    const [itemModalDelete, setItemModalDelete] = useState(false)
    const [catModalDelete, setCatModalDelete] = useState(false);

    const itemModalFunDelete = () => setItemModalDelete(false)
    const catModalFunDelete = () => setCatModalDelete(false);

    const itemModalFunBtnDelete = () => setItemModalDelete(true)
    const catModalFunBtnDelete = () => setCatModalDelete(true);



    ///// Category operations
    const addCategory = () => {

        if (Id) {

            if (catName) {
                try {
                    const dbRef = ref(db, `web/pos/${Id}/categories/`);

                    const newbranchRef = push(dbRef, {

                        Name: catName,

                    });
                    const newCreditKey = newbranchRef.key;

                    catModalFun()
                    addCatsuccessFun()
                }
                catch {
                    console.log('did not add category')
                    catModalFunEdit()
                    addCatFailFun()
                }
            }
            else {
                catModalFunEdit()
                addCatFailBlankFun()
            }

        }

    };


    const [catDeleteID, setCatDeleteId] = useState()

    const catDeletesetID = (id) => {

        catModalFunBtnDelete()

        setCatDeleteId(id)
    }


    const deleteCategory = () => {

        if (Id) {

            if (categoriesTotal == 1) {

                remove(ref(db, `web/pos/${Id}/categories`)).then(() => {

                    useUserCategories.setState({ userCategories: null });
                    useUserCategoriesTotal.setState({ userCategoriesTotal: null });
                    catModalFunDelete()
                    deleteCatsuccessFun()

                })
                    .catch((error) => {
                        catModalFunDelete()
                        deleteCatFailFun()
                    });

            } else {
                remove(ref(db, `web/pos/${Id}/categories/${catDeleteID}`)).then(() => {
                    catModalFunDelete()
                    deleteCatsuccessFun()
                })
                    .catch((error) => {
                        catModalFunDelete()
                        deleteCatFailFun()
                    });
            }
        }


    };


    const [catEditID, setCatEditId] = useState()

    const catEditsetID = (id, jina) => {

        catModalFunBtnEdit()

        setCatEditId(id)
        setCatName(jina)
    }


    const editCategories = (id) => {

        if (Id) {

            if (catName) {

                try {
                    const dbRef = ref(db, `web/pos/${Id}/categories/${catEditID}`);
                    const newbranchRef = update(dbRef, {

                        Name: catName,

                    });

                    const newCreditKey = newbranchRef.key;

                    catModalFunEdit()
                    editCatsuccessFun()

                }
                catch {
                    console.log('did not edit category')
                    catModalFunEdit()
                    editCatFailFun()
                }
            }
            else {
                catModalFunEdit()
                addCatFailBlankFun()

            }

        }

    };

    ////// Handlers for item operations
    const addItem = () => {

        if (Id) {

            if (itemName && itemPrice && ItemCategory && itemStock) {
                try {
                    const dbRef = ref(db, `web/pos/${Id}/items/`);

                    const newbranchRef = push(dbRef, {

                        Name: itemName,
                        Price: itemPrice,
                        Stock: itemStock,
                        Category: ItemCategory,
                        Unit: itemUnit,
                        Code: itemCode,

                    });
                    const newCreditKey = newbranchRef.key;

                    itemModalFun()
                    addItemsuccessFun()

                }
                catch {
                    console.log("did not add item ")
                    itemModalFun()
                    addItemFailFun()
                }
            }
            else {
                itemModalFun()
                addItemFailBlankFun()
            }
        }


    };



    const [itemdeleteID, setItemDeleteId] = useState()

    const itemDeletesetID = (id) => {

        itemModalFunBtnDelete()
        setItemDeleteId(id)
    }


    const deleteItem = () => {

        if (Id) {

            if (itemsTotal == 1) {

                remove(ref(db, `web/pos/${Id}/items`)).then(() => {

                    useUserItems.setState({ userItems: null });
                    useUserItemsTotal.setState({ userItemsTotal: null });

                    itemModalFunDelete()
                    deleteItemsuccessFun()

                })
                    .catch((error) => {

                        itemModalFunDelete()
                        deleteItemFailFun()

                    });

            } else {
                remove(ref(db, `web/pos/${Id}/items/${itemdeleteID}`)).then(() => {
                    itemModalFunDelete()
                    deleteItemsuccessFun()

                })
                    .catch((error) => {
                        itemModalFunDelete()
                        deleteItemFailFun()
                    });
            }
        }


    };



    const [itemEditID, setItemEditId] = useState()

    const itemEditsetID = (id, jina, stock, price, category, unit, code) => {

        itemModalFunBtnEdit()

        setItemEditId(id)
        setItemName(jina)
        setItemPrice(price)
        setItemStock(stock)
        setItemCode(code)
        setItemUnit(unit)
        setItemCategory(category)
    }

    const editItem = () => {

        if (Id) {

            try {
                const dbRef = ref(db, `web/pos/${Id}/items/${itemEditID}`);
                const newbranchRef = update(dbRef, {

                    Name: itemName,
                    Price: itemPrice,
                    Stock: itemStock,
                    Unit: itemUnit,
                    Code: itemCode,
                    Category: ItemCategory,

                });
                const newCreditKey = newbranchRef.key;

                itemModalFunEdit()
                editItemsuccessFun()
            }
            catch {
                console.log("did not edit item")
                itemModalFunEdit()
                editItemFailFun()
            }

            // else {
            //   itemModalFunEdit()
            // addItemFailBlankFun()
            // }
        }


    };

    // Print the items table
    const handlePrint = () => {
        window.print();
    };

    // Download the items as a CSV file
    const handleDownload = () => {
        const csvContent =
            "data:text/csv;charset=utf-8," +
            items
                .map((item) => `${item.name},${item.category},${item.stock}`)
                .join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "items.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    };


    //// Auto Categories Modal
    const [addCatModalsuccess, setAddCatsuccess] = useState(false);
    const [addCatModalFail, setAddCatFail] = useState(false);
    const [addCatModalFailBlank, setAddCatFailBlank] = useState(false);

    const [editCatModalsuccess, setEditCatsuccess] = useState(false);
    const [editCatModalFail, setEditCatFail] = useState(false);

    const [deleteCatModalsuccess, setDeleteCatsuccess] = useState(false);
    const [deleteCatModalFail, setDeleteCatFail] = useState(false);

    const addCatsuccessFun = () => {
        setAddCatsuccess(true);
        setTimeout(() => setAddCatsuccess(false), 1500);
    };

    const addCatFailFun = () => {
        setAddCatFail(true);
        setTimeout(() => setAddCatFail(false), 1500);
    };

    const addCatFailBlankFun = () => {
        setAddCatFailBlank(true);
        setTimeout(() => setAddCatFailBlank(false), 1500);
    };

    const editCatsuccessFun = () => {
        setEditCatsuccess(true);
        setTimeout(() => setEditCatsuccess(false), 1500);
    };

    const editCatFailFun = () => {
        setEditCatFail(true);
        setTimeout(() => setEditCatFail(false), 1500);
    };

    const deleteCatsuccessFun = () => {
        setDeleteCatsuccess(true);
        setTimeout(() => setDeleteCatsuccess(false), 1500);
    };

    const deleteCatFailFun = () => {
        setDeleteCatFail(true);
        setTimeout(() => setDeleteCatFail(false), 1500);
    };


    //// Auto Items modals
    const [addItemModalsuccess, setAddItemsuccess] = useState(false);
    const [addItemModalFail, setAddItemFail] = useState(false);
    const [addItemModalFailBlank, setAddItemFailBlank] = useState(false);

    const [editItemModalsuccess, setEditItemsuccess] = useState(false);
    const [editItemModalFail, setEditItemFail] = useState(false);

    const [deleteItemModalsuccess, setDeleteItemsuccess] = useState(false);
    const [deleteItemModalFail, setDeleteItemFail] = useState(false);


    const addItemsuccessFun = () => {
        setAddItemsuccess(true);
        setTimeout(() => setAddItemsuccess(false), 1500);
    };

    const addItemFailFun = () => {
        setAddItemFail(true);
        setTimeout(() => setAddItemFail(false), 1500);
    };

    const addItemFailBlankFun = () => {
        setAddItemFailBlank(true);
        setTimeout(() => setAddItemFailBlank(false), 1500);
    };

    const editItemsuccessFun = () => {
        setEditItemsuccess(true);
        setTimeout(() => setEditItemsuccess(false), 1500);
    };

    const editItemFailFun = () => {
        setEditItemFail(true);
        setTimeout(() => setEditItemFail(false), 1500);
    };

    const deleteItemsuccessFun = () => {
        setDeleteItemsuccess(true);
        setTimeout(() => setDeleteItemsuccess(false), 1500);
    };

    const deleteItemFailFun = () => {
        setDeleteItemFail(true);
        setTimeout(() => setDeleteItemFail(false), 1500);
    };


    return (
        <div className={`min-h-screen flex flex-col 
          ${theme === "Dark"
                ? "text-white "
                : "bg-gray-200 text-black rounded-lg"
            }`} >


            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row flex-grow rounded-xl">

                {/* Categories Management */}
                <aside className="w-full lg:w-1/3 p-6 shadow-xl sm:h-screen flex flex-col h-96  my-3 sm:my-0 rounded-xl  ">

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold"
                        >Manage Categories</h3>
                        <button
                            className={` text-sm px-3 py-1 rounded  
                             ${theme === "Dark"
                                    ? "text-white  bg-green-800  hover:bg-green-600   "
                                    : "bg-green-600 text-white   hover:bg-green-800"
                                }`}
                            onClick={catModalFunBtn}
                        >
                            + Add Category
                        </button>
                    </div>

                    {/* Scrollable Categories Section */}
                    <div className=" grid sm:grid-cols-1 grid-cols-2 gap-2 px-10 pt-2 overflow-y-auto   ">
                        {categories && categories.map((category, index) => (
                            <div
                                key={index}
                                className={`w-100 shadow-lg text-center p-3 rounded-xl 
                                 ${theme === "Dark"
                                        ? "  border border-blue-800  "
                                        : "bg-white hover:bg-blue-200 "
                                    }`}
                            >
                                <p className=" font-semibold text-md "

                                >{category.Name}</p>
                                <button
                                    className={` py-1 px-2 mt-2 mx-2 rounded 
                                      ${theme === "Dark"
                                            ? "text-white  bg-blue-800  hover:bg-blue-600   "
                                            : "bg-blue-600 text-white   hover:bg-blue-800"
                                        }`}
                                    onClick={() => catEditsetID(category.id, category.Name)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={` px-2 py-1 mx-2 mt-2 rounded
                                    ${theme === "Dark"
                                            ? "text-white  bg-red-800  hover:bg-red-600 "
                                            : "bg-red-600 text-white  hover:bg-red-800  "
                                        }`}
                                    onClick={() => catDeletesetID(category.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        ))}

                        {!categories &&
                            <div>
                                <div className=" justify-center flex mt-20">
                                    <FaTags className={` text-4xl 
                                      ${theme === "Dark"
                                            ? " text-white"
                                            : " text-black "
                                        }`
                                    } />
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

                {/* Items Management */}
                <section className="w-full lg:w-2/3 h-screen flex flex-col rounded-xl ">

                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-lg font-bold m-5">Items Management</h3>

                    </div>

                    <div className="flex justify-between items-center mb-4">
                        {/* Search Bar */}
                        <div className="flex flex-row">

                            <input
                                type="text"
                                placeholder="Search items..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full sm:w-64 md:w-80 lg:w-[300px] p-2 ml-2 rounded-xl 
                                   ${theme === "Dark"
                                        ? "bg-gray-300  text-black hover:bg-gray-100"
                                        : "bg-white shadow-lg  hover:bg-gray-100"
                                    }`}


                            />
                            <FaSearch className=" text-xl ml-2 mt-2" />

                        </div>


                        {/* Print and Download Buttons */}
                        <div className="flex space-x-4 mr-4 ">

                            {/**
                           *  <button
                                className="bg-blue-500 text-sm text-white py-2 px-4 rounded shadow hover:bg-green-600 focus:outline-none focus:ring"
                                onClick={handlePrint}
                            >
                                Print
                            </button>
                           */}

                            <button
                                className={` text-sm px-4 py-2 sm:rounded rounded-lg  mx-4    
                                         ${theme === "Dark"
                                        ? "text-white  bg-green-800  hover:bg-green-600   "
                                        : "bg-green-600 text-white   hover:bg-green-800"
                                    }`}
                                onClick={itemModalFunBtn}
                            >
                                + Add Item
                            </button>
                            <button
                                className={`text-sm px-4 py-2 sm:rounded rounded-lg  mx-3
                                   ${theme === "Dark"
                                        ? "text-white  bg-blue-800 hover:bg-blue-600   "
                                        : "bg-blue-600 text-white hover:bg-blue-800"
                                    }`}
                                onClick={handleDownload}
                            >
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Items Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full table-auto shadow-lg rounded">
                            <thead className={`top-0"
                            ${theme === "Dark"
                                    ? "bg-blue-800 "
                                    : " bg-blue-600 text-white "
                                }`}
                            >
                                <tr>
                                    <th className={`border px-4 py-1 text-md 
                                     ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`}
                                    >#</th>
                                    <th className={`border px-4 py-1 text-md 
                                     ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`}
                                    >Name</th>
                                    <th className={`border px-4 py-1 text-md 
                                     ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`}
                                    >Category</th>
                                    <th className={`border  px-4 py-1 text-md 
                                     ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`}>Stock</th>
                                    <th className={`border px-4 py-1 text-md 
                                     ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`} >Price</th>
                                    <th className={`border  px-4 py-1 text-md 
                                    ${theme === "Dark"
                                            ? "border-blue-800 "
                                            : "border-gray-300 "
                                        }`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items && items.filter((item) => item.Name.toLowerCase().includes(searchQuery.toLowerCase())) // Filter items by search query
                                    .map((item, index) => (
                                        <tr key={item.id} className={` text-sm 
                    
                                            ${theme === "Dark"
                                                ? " hover:bg-blue-100 hover:text-black   "
                                                : " bg-white border border-gray-300 hover:bg-blue-100   "
                                            }`}
                                        >
                                            <td className={` px-4 text-center py-2
                                              ${theme === "Dark"
                                                    ? "border-blue-800 "
                                                    : "border-gray-300 border"
                                                }`}>{index + 1}</td>
                                            <td className={` px-4 text-center py-2  
                                              ${theme === "Dark"
                                                    ? "border-blue-800 "
                                                    : "border-gray-300 border "
                                                }`}>{item.Name}</td>
                                            <td className={`px-4 text-center py-2
                                              ${theme === "Dark"
                                                    ? "border-blue-800 "
                                                    : "border-gray-300  border"
                                                }`}>{item.Category}</td>
                                            <td className={`  px-4 text-center py-2
                                              ${theme === "Dark"
                                                    ? "border-blue-800 "
                                                    : "border-gray-300 border "
                                                }`}
                                            >{item.Stock}</td>
                                            <td className={` px-4 text-center py-2
                                              ${theme === "Dark"
                                                    ? "border-blue-800 "
                                                    : "border-gray-300 border "
                                                }`}
                                            >{item.Price}</td>
                                            <td className={`px-4 py-2 text-center
                                              ${theme === "Dark"
                                                    ? " border-blue-800 "
                                                    : "border-gray-300  border"
                                                }`}
                                            >
                                                <button
                                                    className={`py-1 px-3 mx-2 rounded
                                                          ${theme === "Dark"
                                                            ? "text-white  bg-blue-800  hover:bg-blue-600   "
                                                            : "bg-blue-600 text-white   hover:bg-blue-800"
                                                        }`}
                                                    onClick={() => itemEditsetID(item.id, item.Name, item.Stock, item.Price, item.Category, item.Unit, item.Code)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={` py-1 px-3 rounded sm:my-0 my-3
                                                            ${theme === "Dark"
                                                            ? "text-white  bg-red-800  hover:bg-red-600 "
                                                            : "bg-red-600 text-white  hover:bg-red-800  "
                                                        }`}

                                                    onClick={() => itemDeletesetID(item.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {!items &&
                            <div>
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
                                        No Items Added
                                    </h1>
                                </div>
                            </div>
                        }
                    </div>




                </section>
            </div>

            {/* Items add modal */}

            {itemModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Add Item</h2>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                                <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Code eg D009"
                                    className="w-1/2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemCode}
                                    onChange={(e) => setItemCode(e.target.value)}
                                />
                                <CiBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                            <div className="relative">

                                <select
                                    className="border p-3 rounded my -3 shadow text-black"
                                    value={itemUnit}
                                    onChange={(e) => setItemUnit(e.target.value)}
                                >
                                    <option value="" disabled>
                                        -- Select Unit --
                                    </option>

                                    <>
                                        <option value="DZN">DZN</option>
                                        <option value="CTN">CTN</option>
                                        <option value="PCS">PCS</option>
                                    </>
                                </select>

                            </div>


                            <div className="relative">

                                <select
                                    className="border p-3 rounded my -3 shadow text-black"
                                    value={ItemCategory}
                                    onChange={(e) => setItemCategory(e.target.value)}
                                >
                                    <option value="" disabled>
                                        -- Select Categories --
                                    </option>
                                    <option value="None">None</option>
                                    {categories && (
                                        <>

                                            {categories.map((category) => (
                                                <option key={category.id} value={category.Name}>
                                                    {category.Name}
                                                </option>
                                            ))}
                                        </>
                                    )}

                                </select>

                            </div>


                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Price "
                                    className=" p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemPrice}
                                    onChange={(e) => setItemPrice(e.target.value)}
                                />
                                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />

                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    className=" p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemStock}
                                    onChange={(e) => setItemStock(e.target.value)}
                                />
                                <FaBoxOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                        </div>


                        <div className=" flex flex-row justify-evenly mt-1">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={addItem}
                            >
                                Add
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={itemModalFun}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}


            {/* Items edit  */}
            {itemModalEdit && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Edit Item</h2>


                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Code"
                                    className="w-1/2 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemCode}
                                    onChange={(e) => setItemCode(e.target.value)}
                                />
                                <CiBarcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                            <div className="relative">

                                <select
                                    className="border p-3 rounded my -3 shadow text-black"
                                    value={itemUnit}
                                    onChange={(e) => setItemUnit(e.target.value)}
                                >
                                    <option value="" disabled>
                                        -- Select Unit --
                                    </option>
                                    <>

                                        <option value="DZN">DZN</option>
                                        <option value="CTN">CTN</option>
                                        <option value="PCS">PCS</option>
                                    </>
                                </select>
                            </div>

                            <div className="relative">
                                <select
                                    className="border p-3 rounded my -3 shadow text-black"
                                    value={ItemCategory}
                                    onChange={(e) => setItemCategory(e.target.value)}
                                >
                                    <option value="" disabled>
                                        -- Select Categories --
                                    </option>
                                    <option value="None">None</option>
                                    {categories && (
                                        <>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.Name}>
                                                    {category.Name}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>


                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Price "
                                    className=" p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemPrice}
                                    onChange={(e) => setItemPrice(e.target.value)}
                                />
                                <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />

                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Stock"
                                    className=" p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={itemStock}
                                    onChange={(e) => setItemStock(e.target.value)}
                                />
                                <FaBoxOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>

                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={editItem}
                            >
                                Edit
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={itemModalFunEdit}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}


            {/* Items delete*/}
            {itemModalDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Delete Item</h2>

                        <div className="mt-4 font-semibold text-md">
                            Are you sure you want to delete this item?
                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={deleteItem}
                            >
                                Ok
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={itemModalFunDelete}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}


            {/*Categories modal */}
            {catModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Add Category </h2>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                />
                                <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>
                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={addCategory}
                            >
                                Add
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={catModalFun}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/*Categories edit */}

            {catModalEdit && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Edit Category </h2>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-2 focus:ring-[#303133]  pl-12 shadow-md"
                                    style={{ color: "#000000" }}
                                    value={catName}
                                    onChange={(e) => setCatName(e.target.value)}
                                />
                                <FaTags className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black text-xl" />
                            </div>
                        </div>

                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={editCategories}
                            >
                                Edit
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={catModalFunEdit}
                            >
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/*Categories delete */}

            {catModalDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl shadow w-96 
                        ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white "
                        }`
                    }>
                        <h2 className="text-lg font-bold mb-4 text-center">Delete Category </h2>

                        <div className="mt-4 font-semibold text-md">
                            Are you sure you want to delete this category?
                        </div>
                        <div className=" flex flex-row justify-evenly">
                            <button
                                className={` text-white px-4 py-2 rounded  mt-4 
                                
                              ${theme === "Dark"
                                        ? "bg-green-800  hover:bg-green-600"
                                        : "bg-green-600  hover:bg-green-800 "
                                    }`}
                                onClick={deleteCategory}
                            >
                                OK
                            </button>
                            <button
                                className={` text-white px-4 py-2 rounded mt-4
                                  ${theme === "Dark"
                                        ? "bg-red-800  hover:bg-red-600"
                                        : "bg-red-600  hover:bg-red-800 "
                                    }`}
                                onClick={catModalFunDelete}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Auto-Close Modals */}
            {addCatModalsuccess && (
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
                        <p>The Category was Added</p>
                    </div>
                </div>
            )}

            {addCatModalFail && (
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
                        <p>The Category was not Added</p>
                    </div>
                </div>
            )}


            {addCatModalFailBlank && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}
                    >
                        <div className='flex justify-center'>
                            <TbXboxX className='text-red-600 text-3xl   ' />
                            <h2 className="text-lg font-bold mb-4 mx-1">Failed</h2>
                        </div>
                        <p>Fill all Fields</p>
                    </div>
                </div>
            )}


            {editCatModalsuccess && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
                    <div className={` p-6 rounded-xl 
                    
                     ${theme === "Dark"
                            ? " bg-[#171941] "
                            : " bg-white shadow-lg "
                        }`}>
                        <div className='flex justify-center'>
                            <FaDollarSign className='text-green-600 text-4xl ' />
                            <div className='flex justify-center'>

                                <TiTick className='text-green-600 text-4xl  ' />
                                <h2 className="text-lg font-bold mb-4">Success</h2>
                            </div>
                        </div>
                        <p>The Category was Edited</p>
                    </div>
                </div>
            )}

            {editCatModalFail && (
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
                        <p>The Category was not Edited</p>
                    </div>
                </div>
            )}

            {deleteCatModalsuccess && (
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
                        <p>The Category was Deleted</p>
                    </div>
                </div>
            )}

            {deleteCatModalFail && (
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
                        <p>The Category was not Deleted</p>
                    </div>
                </div>
            )}


            {/**items auto modal */}
            {addItemModalsuccess && (
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

                        <p>The Items was Added</p>
                    </div>
                </div>
            )}

            {addItemModalFail && (
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
                        <p>The Item was not Added</p>
                    </div>
                </div>
            )}

            {addItemModalFailBlank && (
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

            {editItemModalsuccess && (
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
                        <p>The Item was Edited</p>
                    </div>
                </div>
            )}

            {editItemModalFail && (
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
                        <p>The Item was not Edited</p>
                    </div>
                </div>
            )}

            {deleteItemModalsuccess && (
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
                        <p>The Item was Deleted</p>
                    </div>
                </div>
            )}

            {deleteItemModalFail && (
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
                        <p>The Item was not Deleted</p>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Inventory
