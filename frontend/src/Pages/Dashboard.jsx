import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Plus, Search, Trash2, Edit, X, MapPin, Calendar, Phone, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: ''
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <motion.h2 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>Lost & Found</motion.h2>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="nav-actions">
          <span>{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline btn-logout">
            <LogOut size={16} /> Logout
          </button>
        </motion.div>
      </nav>

      <main className="container">
        <div className="toolbar">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search items by name, category..." 
              value={search}
              onChange={handleSearch}
            />
          </div>
          <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ itemName: '', description: '', type: 'Lost', location: '', date: '', contactInfo: '' }) }} className="btn btn-primary">
            {showForm ? <><X size={20} /> Cancel</> : <><Plus size={20} /> Report Item</>}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="form-card-wrapper"
            >
              <div className="form-card">
                <h3>{editingId ? 'Edit Report' : 'Report New Item'}</h3>
                <form onSubmit={handleSubmit} className="item-form">
                  <div className="input-group">
                    <label>Item Name</label>
                    <input type="text" placeholder="e.g. Blue Backpack" required value={formData.itemName} onChange={(e) => setFormData({...formData, itemName: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Status</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                      <option value="Lost">I Lost This Item</option>
                      <option value="Found">I Found This Item</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Location</label>
                    <input type="text" placeholder="e.g. Library 2nd Floor" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Date</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label>Contact Info</label>
                    <input type="text" placeholder="Phone or Email" required value={formData.contactInfo} onChange={(e) => setFormData({...formData, contactInfo: e.target.value})} />
                  </div>
                  <div className="input-group full-width">
                    <label>Description</label>
                    <textarea placeholder="Provide detailed description..." required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary full-width">{editingId ? 'Save Changes' : 'Submit Report'}</button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="items-grid">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div 
                key={item._id} 
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={`item-card ${item.type.toLowerCase()}`}
              >
                <div className="item-stripe"></div>
                <div className="item-header">
                  <h4>{item.itemName}</h4>
                  <span className="badge">{item.type}</span>
                </div>
                <p className="item-desc">{item.description}</p>
                <div className="item-details">
                  <p><MapPin size={16} /> <span>{item.location}</span></p>
                  <p><Calendar size={16} /> <span>{new Date(item.date).toLocaleDateString()}</span></p>
                  <p><Phone size={16} /> <span>{item.contactInfo}</span></p>
                  <p><UserIcon size={16} /> <span>{item.userId?.name || 'Unknown'}</span></p>
                </div>
                {user?.id === item.userId?._id && (
                  <div className="item-actions">
                    <button onClick={() => handleEdit(item)} className="btn-icon text-blue" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item._id)} className="btn-icon text-red" title="Delete"><Trash2 size={16} /></button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-items">
              <img src="/placeholder.svg" alt="No items" style={{ width: 120, opacity: 0.5, marginBottom: 20 }} />
              <p>No items found. Be the first to report something!</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
