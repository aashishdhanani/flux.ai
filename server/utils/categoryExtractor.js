exports.extractCategories = (pythonOutput) => {
    try {
      const lines = pythonOutput.split('\n');
      let jsonLine = '';
      
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line) {
          try {
            JSON.parse(line);
            jsonLine = line;
            break;
          } catch (e) {
            continue;
          }
        }
      }
      
      if (!jsonLine) {
        return [];
      }
  
      const data = JSON.parse(jsonLine);
      
      if (!data || !data.category_analysis || !Array.isArray(data.category_analysis.categories)) {
        return [];
      }
  
      return data.category_analysis.categories
        .filter(category => {
          return category && 
                 typeof category.category_name === 'string' && 
                 Array.isArray(category.products);
        })
        .map(category => ({
          title: category.category_name,
          products: category.products
            .filter(product => product && typeof product.product_name === 'string')
            .map(product => product.product_name)
        }))
        .filter(category => category.products.length > 0);
    } catch (error) {
      console.error('Error parsing Python output:', error);
      return [];
    }
  };
  