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
      console.log('Products fetched:', sortedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/categories');
      setCategories(response.data);
      console.log('Categories fetched:', response.data);
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
    const inputDate = moment(product.importDate, 'DD/MM/YYYY', true); // Strict mode
    if (!inputDate.isValid()) {
      setMessage('Invalid date format. Use DD/MM/YYYY');
      return;
    }

    if (product.name.length > 100) {
      setMessage('Product name must not exceed 100 characters');
      return;
    }

    if (product.quantity <= 0 || !Number.isInteger(Number(product.quantity))) {
      setMessage('Quantity must be a positive integer');
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
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Product Code</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={100}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Import Date (DD/MM/YYYY)</label>
          <input
            type="text"
            name="importDate"
            value={formData.importDate}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="DD/MM/YYYY"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1 p-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.length > 0 ? (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
            Save
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition duration-200">
            Cancel
          </button>
        </div>
      </form>
    );
  };

  const filteredProducts = handleSearch();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Clothing Product Management</h1>
      
      {message && (
        <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 text-center">
          {message}
        </div>
      )}

      <div className="mb-6 flex gap-4 flex-col sm:flex-row">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:w-1/3"
        />
        <select
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:w-1/3"
        >
          <option value="">All categories</option>
          {categories.length > 0 ? (
            categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>
        <button
          onClick={() => setEditingProduct({})}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200 sm:w-auto"
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
        <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">
          No products found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Import Date</th>
                <th className="p-3 text-left">Quantity</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{product.code}</td>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3">{product.importDate}</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3">
                    {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition duration-200"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default App;