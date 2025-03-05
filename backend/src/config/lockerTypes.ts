const cu48 = {
  address: "00",
  totalSlots: 48,
  codeStart: "02",
  codeGetStatus: "50",
  codeOpening: "51",
  codeResponseStatus: "65",
  // codeResponseAllStatus: null,
  codeEnd: "03",
  baudRate: 9600,
};
const cu16 = {
  address: "00",
  totalSlots: 16,
  codeStart: "02",
  codeGetStatus: "30",
  codeOpening: "31",
  codeResponseStatus: "35",
  // codeResponseAllStatus: "36",
  codeEnd: "03",
  baudRate: 9600,
};
export { cu16, cu48 };
