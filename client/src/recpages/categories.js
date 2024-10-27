import React, { useState, useEffect} from 'react';
import Sidebar from './llm.js';
import axios from "axios";


const orange = "#E4801D"
const yellow = "#F7DC11"
const CategoryCard = ({ title, products, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setFlip] = useState(false);
  const [cardContent, setContent] = useState([title]);

  const styles = {
    card: {
      position: 'relative',
      padding: '2rem',
      height: '280px',
      width: '220px',
      margin: '20px 20px',
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
      borderRadius: '20px',
      backdropFilter: 'blur(20px)',
      border: `2px solid ${color}`,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      overflow: 'hidden',
      cursor: isHovered ? 'pointer' : 'default',
    },
    cardContent: {
      height: '100%',
      // display: 'flex',
      // flexDirection: 'column',
      position: 'relative',
      zIndex: 2
    },
    headerSection: {
      // display: 'flex',
      // alignItems: 'left',
      // justifyContent: "flex-start",
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    title: {
      color: color,
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    products: {
      color: color,
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    contentSection: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    glowBorder: {
      position: 'absolute',
      inset: 0,
      padding: '2px',
      borderRadius: '20px',
      background: `linear-gradient(45deg, ${color}40, ${color})`,
      opacity: isHovered ? 1 : 0.3,
      transition: 'opacity 0.3s ease'
    },
    innerBackground: {
      position: 'absolute',
      inset: '2px',
      borderRadius: '18px',
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))'
    }
  };

  const handleHover = (hover) => {
    setIsHovered(hover);
  };

  const handleClick = () => {
    setFlip(!isFlipped);
    setTimeout(() => {
      if (isFlipped) {
        setContent([title]);
      } else {
        setContent(products)
      }
    }, 130);
    
  };


  return (
    <>
        <div
          onClick={handleClick}
          style={{
            ...styles.card,
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            
          }}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        >
          <div style={styles.glowBorder}>
            <div style={styles.innerBackground} />
          </div>
          
          <div style={{...styles.cardContent, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}}>
            <div style={styles.headerSection}>
              {cardContent.map((content, index) => (
                <div>
                <h2 style={ isFlipped ? styles.products : styles.title }>{content}</h2>
                <br></br>
                </div>
              ))}
        
            </div>
            
          </div>
        </div>
    </>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/categories");
        setCategories(response.data); 
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get("http://localhost:3000/brands");
        setBrands(response.data); 
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };

    fetchBrands();
  }, []);

    const styles = {
        container: {
          margin: "0px 30px",
          minHeight: '100vh',
          padding: '2rem'
        },
        title: {
          fontSize: '3.5rem',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #B50D13, #E4801D)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.15em',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif"
        },
        category: {
          margin: '0px 20px',
          textAlign: 'center',
          fontSize: '3.5rem',
          fontWeight: '800',
          color: yellow,
          letterSpacing: '0.15em',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif"
        },
        brands: {
          margin: '0px 20px',
          textAlign: 'center',
          fontSize: '3.5rem',
          fontWeight: '800',
          color: orange,
          letterSpacing: '0.15em',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif"
        },
        subtitle: {
          color: '#2D9CCE',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif",
          fontSize: '1.1rem',
          letterSpacing: '0.05em'
        }
      };
    
    return (
      <>
        <div style={styles.container}>
            <h2 style={styles.title}>Browsing Habits</h2>
            <h2 style= {styles.category}>Categories</h2>
            <div style = {{marginTop: "20px", marginBottom: "20px", display: 'flex', flexWrap: 'wrap'}}>
              {categories.map((category, index) => (
                <CategoryCard
                  key={index}
                  title={category.title} //change if needed
                  products={category.products}
                  color="yellow"
                />
              ))}
            </div>
            <h2 style= {styles.brands}>Brands/Vendors</h2>
            <div style = {{marginTop: "20px", display: 'flex', flexWrap: 'wrap'}}>
            {brands.map((brand, index) => (
                <CategoryCard
                  key={index}
                  title={brand.title} //change if needed
                  products={brand.products}
                  color="orange"
                />
              ))}
            </div>
      
        </div>
        <Sidebar></Sidebar>
      </>
    )
}

export default Categories;