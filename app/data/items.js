const itemsdata = [
  { name: "JUMBO POPCORN CHICKS", price: 2.95, stock: 30 },
  { name: "CHILI CHEESE TOTS OR FRIES", price: 2.95, stock: 25 },
  { name: "MOZZA STICKS W MARN", price: 4.65, stock: 15 },
  { name: "BONLS WINGS", price: 4.65, stock: 20 },
  { name: "CLASSIC CHICK SANDWICH", price: 4.65, stock: 10 },
  { name: "NEW YORK DOG COMBO", price: 5.09, stock: 18 },
  { name: "JUMBO POPCORN CHICKS", price: 2.95, stock: 30 },
  { name: "CHILI CHEESE TOTS OR FRIES", price: 2.95, stock: 25 },
  { name: "MOZZA STICKS W MARN", price: 4.65, stock: 15 },
  { name: "BONLS WINGS", price: 4.65, stock: 20 },
  { name: "CLASSIC CHICK SANDWICH", price: 4.65, stock: 10 },
  { name: "NEW YORK DOG COMBO", price: 5.09, stock: 18 },
  { name: "JUMBO POPCORN CHICKS", price: 2.95, stock: 30 },
  { name: "CHILI CHEESE TOTS OR FRIES", price: 2.95, stock: 25 },
  { name: "MOZZA STICKS W MARN", price: 4.65, stock: 15 },
  { name: "BONLS WINGS", price: 4.65, stock: 20 },
  { name: "CLASSIC CHICK SANDWICH", price: 4.65, stock: 10 },
  { name: "NEW YORK DOG COMBO", price: 5.09, stock: 18 },
  { name: "JUMBO POPCORN CHICK", price: 2.95, stock: 30 },
  { name: "CHILI CHEESE TOTS OR FRIES", price: 2.95, stock: 25 },
  { name: "MOZZA STICKS W MARN", price: 4.65, stock: 15 },
  { name: "BONLS WINGS", price: 4.65, stock: 20 },
  { name: "CLASSIC CHICK SANDWICH", price: 4.65, stock: 10 },
  { name: "NEW YORK DOG COMBO", price: 5.09, stock: 18 },
].map(item => ({
  ...item,
  name: item.name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" "),
}));

export default itemsdata;
