import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

const App = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3001/products');
      const sortedProducts = response.data.sort((a, b) => a.quantity - b.quantity);
      setProducts(sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = () => {
    let filtered = products;
    
    if (searchName) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchCategory) {
      filtered = filtered.filter(product => 
        product.categoryId === parseInt(searchCategory)
      );
    }

    return filtered;
  };

  const handleUpdate = async (product) => {
    if (product.name.length > 100) {
      setMessage('Product name must not exceed 100 characters');
      return;
    }

    if (product.quantity <= 0 || !Number.isInteger(Number(product.quantity))) {
      setMessage('Quantity must be a positive integer');
      return;
    }

    const inputDate = moment(product.importDate, 'DD/MM/YYYY');
    if (!inputDate.isValid()) {
      setMessage('Import date must be in DD/MM/YYYY format');
      return;
    }

    if (inputDate.isAfter(moment())) {
      setMessage('Import date cannot be in the future');
      return;
    }

    try {
      if (product.id) {
        await axios.put(`http://localhost:3001/products/${product.id}`, product);
      } else {
        await axios.post('http://localhost:3001/products', product);
      }
      setMessage('Product updated successfully!');
      fetchProducts();
      setEditingProduct(null);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating product');
      console.error('Error updating product:', error);
    }
  };

  const ProductForm = ({ product, onSave, onCancel }) => {
    const [formData, setFormData] = useState(product || {
      id: null,
      code: '',
      name: '',
      importDate: '',
      quantity: '',
      categoryId: ''
    });

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded-lg">
        <div className="mb-4">
          <label className="block">Product Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            maxLength={100}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">Import Date (DD/MM/YYYY)</label>
          <input
            type="text"
            name="importDate"
            value={formData.importDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="DD/MM/YYYY"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Save
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const filteredProducts = handleSearch();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Clothing Product Management</h1>
      
      {message && (
        <div className="bg-green-100 text-green-700 p-2 rounded mb-4">
          {message}
        </div>
      )}

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => setEditingProduct({})}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSave={handleUpdate}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-red-500 text-center p-4">
          No products found
        </div>
      ) : (
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Code</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Import Date</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="border p-2">{product.code}</td>
                <td className="border p-2">{product.name}</td>
                <td className="border p-2">{product.importDate}</td>
                <td className="border p-2">{product.quantity}</td>
                <td className="border p-2">
                  {categories.find(c => c.id === product.categoryId)?.name}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;