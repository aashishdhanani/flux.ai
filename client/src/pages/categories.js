import React, { useState, useEffect } from 'react';
import axios from "axios";
import Sidebar from '../components/llm.js';
import CategoryCard from '../components/CategoryCard.js';
import '../styles/Categories.css';

const API_BASE_URL = 'http://localhost:3000/api';

const COLORS = {
  orange: "#E4801D",
  yellow: "#F7DC11"
};

const SectionTitle = ({ children, color }) => (
  <h2 className={`section-title ${color}`}>{children}</h2>
);

const CardGrid = ({ items, color }) => (
  <div className="card-grid">
    {items.map((item, index) => (
      <CategoryCard
        key={index}
        title={item.title}
        products={item.products}
        color={COLORS[color]}
      />
    ))}
  </div>
);

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, brandsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/categories`),
          axios.get(`${API_BASE_URL}/analytics/brands`)
        ]);
        
        setCategories(categoriesResponse.data);
        setBrands(brandsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="categories-container">
        <h2 className="main-title">Browsing Habits</h2>
        
        <SectionTitle color="yellow">Categories</SectionTitle>
        <CardGrid items={categories} color="yellow" />
        
        <SectionTitle color="orange">Brands/Vendors</SectionTitle>
        <CardGrid items={brands} color="orange" />
      </div>
      <Sidebar />
    </>
  );
};

export default Categories;