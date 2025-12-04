// rathod-mart-admin/frontend/src/services/productService.js
import api from "./api";

const API_URL = "/products";

class ProductService {
  async getProducts(params = {}) {
    const res = await api.get(API_URL, { params });
    return res.data;
  }

  async getProduct(id) {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
  }

  // --- UPDATED: Sends JSON now ---
  async createProduct(productData) {
    // productData is now a standard JS Object
    const res = await api.post(API_URL, productData);
    return res.data;
  }

  async updateProduct(id, productData) {
    const res = await api.put(`${API_URL}/${id}`, productData);
    return res.data;
  }

  async deleteProduct(id) {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
  }

  async uploadMultipleProductImages(productId, formData) {
    // अगर आप Direct Upload यूज़ कर रहे हैं तो इसकी ज़रूरत कम पड़ेगी,
    // लेकिन बैकवर्ड कम्पैटिबिलिटी के लिए छोड़ सकते हैं या JSON में बदल सकते हैं
    const res = await api.put(`${API_URL}/${productId}`, formData);
    return res.data;
  }

  async getProductImages(productId) {
    const res = await this.getProduct(productId);
    return res.data?.images || [];
  }

  async deleteProductImage(productId, filename) {
    // Sending JSON payload
    const res = await api.put(`${API_URL}/${productId}`, {
      deleteFilenames: [filename],
    });
    return res.data;
  }

  async setPrimaryImage(productId, filename) {
    const res = await api.put(`${API_URL}/${productId}/images/primary`, {
      filename,
    });
    return res.data;
  }

  async recalculateStock(productId) {
    const res = await api.put(`${API_URL}/${productId}/recalculate-stock`);
    return res.data;
  }

  async getProductVariants(productId) {
    const res = await api.get(`${API_URL}/${productId}/variants`);
    return res.data;
  }
}

export const productService = new ProductService();
