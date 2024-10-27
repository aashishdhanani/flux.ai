const MostViewed = () => {
    const styles = {
        container: {
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a1a, #2D9CCE 140%)',
          padding: '2rem'
        },
        header: {
          background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        },
        headerContent: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        },
        title: {
          fontSize: '3.5rem',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #F7DC11, #E4801D)',
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
        },
        grid: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', // Increased minmax value
          gap: '2rem',
          maxWidth: '1400px',
          margin: '0 auto'
        }
      };
    
    return (
        <div style={styles.container}>
            <h2 style={{color: 'white', fontSize: '25px'}}>Most Viewed Categories</h2>
        </div>
    )
}

export default MostViewed;