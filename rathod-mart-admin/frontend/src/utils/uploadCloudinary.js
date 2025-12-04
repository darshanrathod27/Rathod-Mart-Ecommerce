import axios from "axios";

// अपनी .env फाइल या हार्डकोडेड वैल्यू यहाँ डालें
// नोट: Vite में env वेरिएबल import.meta.env से एक्सेस होते हैं
const CLOUD_NAME = "ddppvgnjl"; // आपकी Cloudinary Cloud Name
const UPLOAD_PRESET = "rathod_mart_unsigned"; // जो आपने अभी बनाया

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "rathod-mart");

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    // यह URL और Public ID वापस देगा
    return {
      url: res.data.secure_url,
      publicId: res.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};
