const MidtransClient = require('midtrans-client');

export const snap = new MidtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});