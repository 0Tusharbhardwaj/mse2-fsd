import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Plus, Search, Trash2, Edit } from 'lucide-react';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    type: 'Lost',
    location: '',
    date: '',
    contactInfo: ''
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async (searchQuery = '') => {
    try {
      const endpoint = searchQuery ? `/items/search?name=${searchQuery}` : '/items';
      const res = await api.get(endpoint);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchItems(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/items/${editingId}`, formData);
      } else {
        await api.post('/items', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/items/${id}`);
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting item');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date.split('T')[0],
      contactInfo: item.contactInfo
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>Lost & Found Dashboard</h2>
        <div className="nav-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="container">
        <div className="toolbar">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search items by name or type..." 
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' }) }} className="btn btn-primary">
            <Plus size={20} /> {showForm ? 'Close Form' : 'Report Item'}
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h3>{editingId ? 'Edit Item' : 'Report Lost/Found Item'}</h3>
            <form onSubmit={handleSubmit} className="item-form">
              <input type="text" placeholder="Item Name" required value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
              </select>
              <input type="text" placeholder="Location" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              <input type="text" placeholder="Contact Info" required value={formData.contactInfo} onChange={(e) => setFormData({...formData, contactInfo: e.target.value})} />
              <textarea placeholder="Description" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update Item' : 'Submit Item'}</button>
            </form>
          </div>
        )}

        <div className="items-grid">
          {items.map(item => (
            <div key={item._id} className={`item-card ${item.type.toLowerCase()}`}>
              <div className="item-header">
                <span className="badge">{item.type}</span>
                <h4>{item.itemName}</h4>
              </div>
              <p className="item-desc">{item.description}</p>
              <div className="item-details">
                <p><strong>Location:</strong> {item.location}</p>
                <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
                <p><strong>Contact:</strong> {item.contactInfo}</p>
                <p><strong>Reported by:</strong> {item.userId.name}</p>
              </div>
              {user?.id === item.userId._id && (
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)} className="btn-icon text-blue"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item._id)} className="btn-icon text-red"><Trash2 size={18} /></button>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && <div className="no-items">No items found.</div>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
