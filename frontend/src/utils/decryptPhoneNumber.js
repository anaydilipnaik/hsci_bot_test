import CryptoJS from "crypto-js";

export const decryptPhone = (encryptedData) => {
  const secretKey = "hash-phone"; // Use the same key used for encryption
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
};
