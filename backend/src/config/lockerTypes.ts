const cu48 = {
  address: 0, // Reglage sur plaque cu48
  totalSlots: 48,
  codeStart: "02",
  codeGetStatus: "50",
  codeOpening: "51",
  codeResponseStatus: "65",
  // codeResponseAllStatus: null,
  codeEnd: "03",
  baudRate: 19200,
};
const cu16 = {
  address: 0, // Reglage sur plaque cu48
  totalSlots: 16,
  codeStart: "02",
  codeGetStatus: "30",
  codeOpening: "31",
  codeResponseStatus: "35",
  // codeResponseAllStatus: "36",
  codeEnd: "03",
  baudRate: 19200,
};
export { cu16, cu48 };
