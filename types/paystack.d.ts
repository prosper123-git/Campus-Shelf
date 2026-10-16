type PaystackResponse = { reference: string };

type PaystackHandler = {
  openIframe: () => void;
};

type PaystackOptions = {
  key: string;
  email: string;
  amount: number;
  currency: "NGN";
  ref: string;
  metadata: { courseCode: string; uid: string };
  callback: (response: PaystackResponse) => void;
  onClose: () => void;
};

type PaystackPop = {
  setup: (options: PaystackOptions) => PaystackHandler;
};

interface Window {
  PaystackPop?: PaystackPop;
}
