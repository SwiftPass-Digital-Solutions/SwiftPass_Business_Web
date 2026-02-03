declare module '@paystack/inline-js' {
  const PaystackPop: {
    setup: (options: any) => {
      openIframe?: () => void;
    } & any;
  };

  export default PaystackPop;
}
