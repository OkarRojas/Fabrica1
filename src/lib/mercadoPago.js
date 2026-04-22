import { initMercadoPago } from "@mercadopago/sdk-react";

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;

if (publicKey) {
  initMercadoPago(publicKey);
}
