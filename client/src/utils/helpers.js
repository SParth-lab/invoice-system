export const GST_RATES = [
  { label: "0% GST",  cgst: 0,   sgst: 0   },
  { label: "5% GST",  cgst: 2.5, sgst: 2.5 },
  { label: "12% GST", cgst: 6,   sgst: 6   },
  { label: "18% GST", cgst: 9,   sgst: 9   },
  { label: "28% GST", cgst: 14,  sgst: 14  },
];

export const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const num = (v) => parseFloat(v) || 0;

export function toWords(amount) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if (n === 0) return "";
    if (n < 20) return a[n] + " ";
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10] + " ";
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + "Crore " + inWords(n % 10000000);
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = (inWords(rupees) || "Zero ") + "Rupees";
  if (paise > 0) result += " and " + inWords(paise) + "Paise";
  return result.trim() + " Only";
}
