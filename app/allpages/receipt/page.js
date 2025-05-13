"use client"

import React, { useState } from "react";
import { useUserCartReceipt, useUserCartTotalReceipt } from "@/app/componets/zustand/receipt";
import { QRCodeSVG } from 'qrcode.react';


const Receipt = () => {

    const cart = useUserCartReceipt((state) => state.userCartReceipt)

    const total = useUserCartTotalReceipt((state) => state.userCartTotalReceipt)

    const receiptData = {

        tillNo: "4",
        ms: "ASKAH",
        date: "01/04/2025",
        time: "09:21:35",
    }


    const totalItems = cart.length;
    console.log("cart items", cart)
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

        <div>

            <div className=" flex items-center justify-center bg-black bg-opacity-80 overflow-y-auto ">
                <div
                    className={`p-4  shadow w-[380px] font-sans text-sm  bg-white text-black

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
                    <div className="bg-black text-white text-4xl py-1 text-center  font-bold ">
                        PAYBILL: 157424
                    </div>
                    <div className="border-t border-dotted border-black/20 mt-1"></div>

                    {/* Cash Sale Header */}

                    <div className="text-center font-bold text-2xl mb-2">CASH SALE</div>
                    <div className="border-t border-dotted border-black/20"></div>
                    <div className="flex justify-between mb-2 font-bold">
                        <div>
                            <p className="text-sm  ">Till No: {receiptData.tillNo}</p>
                            <p className="text-sm ">M/S: {receiptData.ms}</p>
                            <p className="text-sm ">PIN:</p>
                        </div>
                        <div>
                            <p className="text-sm">Cash Sale #: MRCS644162</p>
                        </div>

                    </div>
                    <div className="border-t border-dotted border-black/20"></div>

                    <div className="flex justify-between mb-1">
                        <p className="text-sm">Date: {receiptData.date}</p>
                        <p className="text-sm ">Time:<span className="text-xs mx-3"> {receiptData.time}</span></p>
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
                        <p className="font-bold">YOU WERE SERVED BY : TILL 04</p>
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

                    <div className="flex flex-row justify-evenly mt-4">
                        <button
                            className={`text-white px-4 py-2 rounded bg-green-600 hover:bg-green-800
                    `}
                            onClick={() => window.print()}
                        >
                            Print
                        </button>
                        <button
                            className={`text-white px-4 py-2 rounded bg-red-600 hover:bg-red-800
                       `}
                            onClick={''}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Receipt;
