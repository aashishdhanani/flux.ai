import React, { useState } from 'react';


const orange = "#E4801D"
const yellow = "#F7DC11"
const CategoryCard = ({ title, children, img, products, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setFlip] = useState(false);
  const [cardContent, setContent] = useState(title);



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
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 2
    },
    headerSection: {
      display: 'flex',
      alignItems: 'center',
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
        setContent(title);
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
              <h2 style={ isFlipped ? styles.products : styles.title }>{cardContent}</h2>
            </div>
            
          </div>
        </div>
    </>
  );
};

const Categories = () => {
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
          background: yellow,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '0.15em',
          fontFamily: "'Segoe UI', 'Roboto', sans-serif"
        },
        brands: {
          margin: '0px 20px',
          textAlign: 'center',
          fontSize: '3.5rem',
          fontWeight: '800',
          background: orange,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
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
        <div style={styles.container}>
            <h2 style={styles.title}>Browsing Habits</h2>
            <h2 style= {styles.category}>Categories</h2>
            <div style = {{marginTop: "20px", marginBottom: "20px", display: 'flex', flexWrap: 'wrap'}}>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {yellow}></CategoryCard>
            </div>
            <h2 style= {styles.brands}>Brands/Vendors</h2>
            <div style = {{marginTop: "20px", display: 'flex', flexWrap: 'wrap'}}>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
              <CategoryCard title="Placeholder Category" img="placeholder_image.jpg" products = "placeholder products" color = {orange}></CategoryCard>
            </div>
      
        </div>
    )
}

export default Categories;