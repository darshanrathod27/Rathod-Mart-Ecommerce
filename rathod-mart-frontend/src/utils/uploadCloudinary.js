import axios from "axios";

// अपनी .env फाइल से वैल्यूज लें या हार्डकोड करें
const CLOUD_NAME = "ddppvgnjl";
const UPLOAD_PRESET = "rathod_mart_unsigned";

export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "rathod-mart/profiles"); // Profiles के लिए अलग फोल्डर (Optional)

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return {
      url: res.data.secure_url,
      publicId: res.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};
