const cu48 = {
  address: 0x00, // Reglage sur plaque cu48
  codeStart: 0x02,
  codeGetStatus: 0x50,
  codeOpening: 0x51,
  codeResponseStatus: 0x65,
  codeEnd: 0x03,
  
  totalSlots: 48,
  baudRate: 19200,
};
const cu16 = {
  address: 0x00, // Reglage sur plaque cu16
  codeStart: 0x02,
  codeGetStatus: 0x30,
  codeOpening: 0x31,
  codeResponseStatus: 0x35,
  codeEnd: 0x03,
  
  totalSlots: 16,
  baudRate: 19200,
};
export { cu16, cu48 };
