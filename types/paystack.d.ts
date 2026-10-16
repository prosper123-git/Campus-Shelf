type PaystackResponse = { reference: string };

type PaystackOptions = {
  key: string;
  email: string;
  amount: number;
  currency: "NGN";
  reference: string;
  metadata: { courseCode: string; uid: string };
  onSuccess: (response: PaystackResponse) => void | Promise<void>;
  onCancel: () => void;
  onError: (error: unknown) => void;
};

type PaystackPop = new () => {
  checkout: (options: PaystackOptions) => Promise<unknown>;
};

interface Window {
  PaystackPop?: PaystackPop;
}
