import os
from langchain_groq import ChatGroq
from typing import List
from pydantic import BaseModel, Field
import json
from typing import Dict, Any
from pymongo import MongoClient
from bson.objectid import ObjectId

os.environ["GROQ_API_KEY"] = ""

# Initialize the LLM (ensure GROQ_API_KEY is set in your environment)
llm = ChatGroq(model="llama3-8b-8192")

class BrandCategoryExtractionOutput(BaseModel):
    productName: str = Field(..., description="Name of the product")
    productBrand: str = Field(..., description="Extracted brand name from the product")
    productCategory: str = Field(..., description="Assigned category for the product")

class GraphExplanation(BaseModel):
    graph_title: str = Field(..., description="Title of the graph")
    explanation: str = Field(..., description="Explanation of the graph and the relationship between the variables")

# Pydantic Models for Category-Based Analysis
class ProductDescription(BaseModel):
    product_name: str = Field(..., description="Name of the product")
    description: str = Field(..., description="Description of customer's habits related to this product")

class ProductCategory(BaseModel):
    category_name: str = Field(..., description="Name of the product category")
    products: List[ProductDescription] = Field(..., description="List of products in this category")

class ProductCategoryDescriptions(BaseModel):
    categories: List[ProductCategory] = Field(..., description="List of product categories and their products")

# Pydantic Models for Brand-Based Analysis
class BrandProductDescription(BaseModel):
    product_name: str = Field(..., description="Name of the product")
    description: str = Field(..., description="Description of customer's habits related to this product")

class BrandAnalysis(BaseModel):
    brand_name: str = Field(..., description="Name of the brand")
    products: List[BrandProductDescription] = Field(..., description="List of products from this brand")

class BrandDescriptions(BaseModel):
    brands: List[BrandAnalysis] = Field(..., description="List of brands and their products")

# Pydantic Model for Final Financial Advice
class FinalFinancialAdvice(BaseModel):
    summary: str = Field(..., description="Overall summary of customer's financial habits")
    recommendations: List[str] = Field(..., description="List of actionable financial recommendations")

# Create the structured LLMs
category_structured_llm = llm.with_structured_output(ProductCategoryDescriptions)
brand_structured_llm = llm.with_structured_output(BrandDescriptions)
extraction_structured_llm = llm.with_structured_output(BrandCategoryExtractionOutput)

# Initialize MongoDB Client
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")  # Replace with your MongoDB URI
client = MongoClient(MONGODB_URI)
db = client['your_database_name']  # Replace with your database name
users_collection = db['users']
productevents_collection = db['productevents']

# Function to fetch user data and products from MongoDB
def fetch_user_data(username: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    # Fetch user document by username
    user = users_collection.find_one({'username': username})
    if not user:
        raise ValueError(f"User '{username}' not found.")

    user_info = {
        'goals': user.get('goals', []),
        'budget': user.get('budget', 0)
    }

    # Fetch product events for the user
    product_events = productevents_collection.find({'userId': user['_id']})
    products = []
    for event in product_events:
        product = {
            'ecommerceSite': event.get('platform', ''),
            'productName': event.get('productTitle', ''),
            'productPrice': event.get('price', 0),
            'productPurchased': True  # Assuming all events are purchases; modify if needed
        }
        products.append(product)

    return user_info, products

def extract_brand_and_category(product, categories, brands):
    """
    Extracts the brand and assigns a category to a product using the LLM.
    
    Args:
        product (dict): The product dictionary.
        categories (list): The existing list of categories.
        brands (list): The existing list of brands.
    
    Returns:
        dict: The product dictionary with 'productBrand' and 'productCategory' assigned.
    """
    prompt = f"""
You are a financial advisor analyzing a customer's shopping habits. Based on the product name and existing brands and categories, extract the brand and assign a category to the product.

Existing Brands: {brands if brands else "None"}
Existing Categories: {categories if categories else "None"}

Product Name: "{product['productName']}"

Instructions:
- Identify the brand name from the product name.
- Assign the product to one of the existing categories if applicable. If it doesn't fit any existing category, create a new appropriate category and assign it.
- Output the result as a JSON object matching the following schema:

```json
{{
  "productName": "Wireless Mouse Logitech",
  "productBrand": "Logitech",
  "productCategory": "Electronics"
}}```

Example:
```json
{{
  "productName": "Blender Ninja",
  "productBrand": "Ninja",
  "productCategory": "Home Appliances"
}}```

Ensure that the output JSON strictly adheres to the schema above. Do not include any additional text or explanations.
"""

    try:
        response = llm.invoke(prompt.strip())
        response_text = response.content.strip()
        
        # Attempt to parse the JSON output
        extracted = json.loads(response_text)
        
        # Validate the keys
        if not all(k in extracted for k in ("productBrand", "productCategory")):
            print(f"Invalid output format for '{product['productName']}': Missing 'productBrand' or 'productCategory'.")
            extracted['productBrand'] = "Unknown"
            extracted['productCategory'] = "Miscellaneous"
        
        # Ensure the extracted values are strings
        product_brand = extracted.get('productBrand', "Unknown")
        product_category = extracted.get('productCategory', "Miscellaneous")
        
        if not isinstance(product_brand, str):
            product_brand = "Unknown"
        if not isinstance(product_category, str):
            product_category = "Miscellaneous"
        
        # Check if the brand already exists (case-insensitive)
        existing_brand = next((b for b in brands if b.lower() == product_brand.lower()), None)
        if existing_brand:
            product_brand = existing_brand
        else:
            brands.append(product_brand)
        
        # Check if the category already exists (case-insensitive)
        existing_category = next((c for c in categories if c.lower() == product_category.lower()), None)
        if existing_category:
            product_category = existing_category
        else:
            categories.append(product_category)
        
        # Update the product dictionary
        product['productBrand'] = product_brand
        product['productCategory'] = product_category
        
        return product
    except json.JSONDecodeError as e:
        print(f"JSON parsing error for '{product['productName']}': {e}")
        product['productBrand'] = "Unknown"
        product['productCategory'] = "Miscellaneous"
        return product
    except Exception as e:
        print(f"An error occurred while extracting brand and category for '{product['productName']}': {e}")
        product['productBrand'] = "Unknown"
        product['productCategory'] = "Miscellaneous"
        return product

# Function to group products by category
def prepare_category_prompt_data(products):
    from collections import defaultdict
    category_products = defaultdict(list)
    for product in products:
        category_products[product['productCategory']].append(product)
    return dict(category_products)

# Function to group products by brand
def prepare_brand_prompt_data(products):
    from collections import defaultdict
    brand_products = defaultdict(list)
    for product in products:
        brand_products[product['productBrand']].append(product)
    return dict(brand_products)

# Data computation functions (unchanged)
def compute_total_spending_by_category(products):
    from collections import defaultdict
    category_spending = defaultdict(float)
    for product in products:
        if product['productPurchased']:
            category_spending[product['productCategory']] += product['productPrice']
    return dict(category_spending)

def compute_total_spending_by_brand(products):
    from collections import defaultdict
    brand_spending = defaultdict(float)
    for product in products:
        if product['productPurchased']:
            brand_spending[product['productBrand']] += product['productPrice']
    return dict(brand_spending)

def compute_spending_by_ecommerce_site(products):
    from collections import defaultdict
    site_spending = defaultdict(float)
    for product in products:
        if product['productPurchased']:
            site_spending[product['ecommerceSite']] += product['productPrice']
    return dict(site_spending)

def compute_average_spending_per_purchase(products):
    purchased_products = [p for p in products if p['productPurchased']]
    purchase_prices = [p['productPrice'] for p in purchased_products]
    return purchase_prices  # List of individual purchase amounts

def compute_number_of_purchases_by_category(products):
    from collections import defaultdict
    category_counts = defaultdict(int)
    for product in products:
        if product['productPurchased']:
            category_counts[product['productCategory']] += 1
    return dict(category_counts)

# Function to generate the product category descriptions
def generate_product_category_descriptions(products, user_info):
    category_products = prepare_category_prompt_data(products)

    # Prepare the prompt
    prompt = f"""
You are a financial advisor analyzing a customer's shopping habits. Based on the following products grouped by category, along with the customer's financial goals and budget, generate a structured output where each product category contains products with descriptions of the customer's habits related to each product.

User Financial Goals: {json.dumps(user_info['goals'])}
User Monthly Budget: {user_info['budget']}

Data:

{json.dumps(category_products, indent=2)}

Instructions:

- For each product category, create an object with the category name and a list of products.
- For each product, include the product name and a brief description (1-2 sentences) about the customer's habits related to that product. Consider factors like purchase frequency, spending patterns, brand preferences, and how these relate to the user's financial goals and budget.
- Output the result as a JSON object matching the provided schema.

Remember to strictly adhere to the JSON structure specified in the schema.
"""

    # Call the LLM
    try:
        response = category_structured_llm.invoke(prompt.strip())
        return response
    except Exception as e:
        print(f"An error occurred in category analysis: {e}")
        return None

def generate_brand_descriptions(products, user_info):
    brand_products = prepare_brand_prompt_data(products)
    
    prompt = f"""
    You are a financial advisor analyzing a customer's shopping habits. Based on the following products grouped by brand, along with the customer's financial goals and budget, generate a structured output.

    User Financial Goals: {json.dumps(user_info['goals'])}
    User Monthly Budget: {user_info['budget']}

    Data:
    
    {json.dumps(brand_products, indent=2)}

    Instructions:
    - For each brand, create an object with the brand name and a list of products.
    - For each product, include the product name and a brief description (1-2 sentences) about the customer's habits related to that product.
    - Output the result as a JSON object matching the provided schema.

    Ensure the output is a valid JSON object conforming to the `BrandDescriptions` schema.
    """
    
    try:
        response = brand_structured_llm.invoke(prompt.strip())
        return response  # Structured output handled by with_structured_output
    except Exception as e:
        print(f"An error occurred in brand analysis: {e}")
        return None

def generate_graph_explanation(graph_title: str, x_variable: str, y_variable: str, data: Dict[Any, Any], user_info) -> GraphExplanation:
    prompt = f"""
    You are a financial advisor analyzing a customer's spending habits. Consider the customer's financial goals and budget while analyzing the data.

    User Financial Goals: {json.dumps(user_info['goals'])}
    User Monthly Budget: {json.dumps(user_info['budget'])}

    Graph Title: {graph_title}

    Data:
    {json.dumps(data, indent=2)}

    Instructions:
    - Analyze the data provided.
    - Explain the relationship between {x_variable} and {y_variable}.
    - Provide insights into the customer's spending habits based on this graph, considering their financial goals and budget.
    - Offer suggestions for financial planning if applicable.
    - Keep the explanation concise and informative.
    - Output the result as a JSON object matching the `GraphExplanation` schema.

    Ensure the output is a valid JSON object conforming to the `GraphExplanation` schema.
    """
    
    try:
        response = llm.with_structured_output(GraphExplanation).invoke(prompt.strip())
        return response  # Structured output handled by with_structured_output
    except Exception as e:
        print(f"An error occurred while generating the explanation for '{graph_title}': {e}")
        return None

def generate_final_financial_advice(
    category_result: ProductCategoryDescriptions,
    brand_result: BrandDescriptions,
    graph_explanations: List[GraphExplanation],
    user_info
) -> FinalFinancialAdvice:
    # Convert all inputs to JSON
    category_json = category_result.dict() if category_result else {}
    brand_json = brand_result.dict() if brand_result else {}
    graphs_json = [graph_explanation.dict() for graph_explanation in graph_explanations if graph_explanation]
    
    # Prepare the prompt with escaped curly braces
    prompt = f"""
You are a financial advisor tasked with providing a comprehensive financial analysis and action plan based on the following data, considering the customer's financial goals and budget.

User Financial Goals: {json.dumps(user_info['goals'])}
User Monthly Budget: {json.dumps(user_info['budget'])}

Category-Based Analysis:
{json.dumps(category_json, indent=2)}

Brand-Based Analysis:
{json.dumps(brand_json, indent=2)}

Graph Explanations:
{json.dumps(graphs_json, indent=2)}

Instructions:

- Synthesize the information from the category-based analysis, brand-based analysis, and graph explanations.
- Provide a concise summary of the customer's financial habits, aligning them with their financial goals and budget.
- Offer actionable financial recommendations based on the insights derived from the data, ensuring they support the user's financial goals and adhere to their budget.
- Ensure the recommendations are data-driven and clearly linked to the insights.
- Keep the report readable, understandable, and informative without being overly verbose.
- Output the result as a JSON object matching the following schema:
```json
{{
  "summary": "Overall summary of customer's financial habits.",
  "recommendations": [
    "Recommendation 1.",
    "Recommendation 2.",
    "...",
    "Recommendation N."
  ]
}}

**Ensure that the output JSON strictly adheres to the schema above. Do not include any additional text or explanations.**
"""

    # Use structured output
    final_financial_llm = llm.with_structured_output(FinalFinancialAdvice)
    
    try:
        response = final_financial_llm.invoke(prompt.strip())
        return response  # Structured output handled by with_structured_output
    except Exception as e:
        print(f"An error occurred while generating the final financial advice: {e}")
        return None



# Adjusted main function
def generate_financial_advice(username: str):
    try:
        user_info, products = fetch_user_data(username)
    except ValueError as ve:
        print(ve)
        return
    except Exception as e:
        print(f"An error occurred while fetching data for user '{username}': {e}")
        return

    categories = []
    brands = []

    # Extract brands and categories for each product
    updated_products = []
    for product in products:
        updated_product = extract_brand_and_category(product, categories, brands)
        updated_products.append(updated_product)
    products = updated_products

    # Generate category-based descriptions
    category_result = generate_product_category_descriptions(products, user_info)
    while not category_result:
        category_result = generate_product_category_descriptions(products, user_info)

    # Generate brand-based descriptions
    brand_result = generate_brand_descriptions(products, user_info)
    while not brand_result:
        brand_result = generate_brand_descriptions(products, user_info)

    # Graph 1: Total Spending by Product Category
    data1 = compute_total_spending_by_category(products)
    explanation1 = generate_graph_explanation(
        graph_title="Total Spending by Product Category",
        x_variable="Product Categories",
        y_variable="Total Spending",
        data=data1,
        user_info=user_info
    )

    # Graph 2: Total Spending by Brand
    data2 = compute_total_spending_by_brand(products)
    explanation2 = generate_graph_explanation(
        graph_title="Total Spending by Brand",
        x_variable="Product Brands",
        y_variable="Total Spending",
        data=data2,
        user_info=user_info
    )

    # Graph 3: Spending Distribution Across E-commerce Sites
    data3 = compute_spending_by_ecommerce_site(products)
    explanation3 = generate_graph_explanation(
        graph_title="Spending Distribution Across E-commerce Sites",
        x_variable="E-commerce Sites",
        y_variable="Total Spending",
        data=data3,
        user_info=user_info
    )

    # Graph 4: Average Spending per Purchase
    data4 = compute_average_spending_per_purchase(products)
    explanation4 = generate_graph_explanation(
        graph_title="Average Spending per Purchase",
        x_variable="Individual Purchases",
        y_variable="Purchase Amount",
        data={"purchase_prices": data4},
        user_info=user_info
    )

    # Graph 5: Number of Purchases per Product Category
    data5 = compute_number_of_purchases_by_category(products)
    explanation5 = generate_graph_explanation(
        graph_title="Number of Purchases per Product Category",
        x_variable="Product Categories",
        y_variable="Number of Purchases",
        data=data5,
        user_info=user_info
    )
    
    # Collect all graph explanations
    graph_explanations = [explanation1, explanation2, explanation3, explanation4, explanation5]

    # Generate final financial advice
    final_advice = generate_final_financial_advice(category_result, brand_result, graph_explanations, user_info)
    while not final_advice:
        final_advice = generate_final_financial_advice(category_result, brand_result, graph_explanations, user_info)
    # Output the results
    print("*** Category-Based Analysis ***\n")
    if category_result:
        print(json.dumps(category_result.dict(), indent=2))
    else:
        print("Category-Based Analysis not available due to an error.")
    
    print("\n*** Brand-Based Analysis ***\n")
    if brand_result:
        print(json.dumps(brand_result.dict(), indent=2))
    else:
        print("Brand-Based Analysis not available due to an error.")

    print("\n*** Graph Explanations ***\n")
    for idx, explanation in enumerate(graph_explanations, 1):
        if explanation:
            print(f"{idx}. {explanation.graph_title}\n{explanation.explanation}\n")
        else:
            print(f"{idx}. Explanation not available due to an error.\n")

    print("*** Final Financial Advice ***\n")
    if final_advice:
        print(json.dumps(final_advice.dict(), indent=2))
    else:
        print("Final Financial Advice not available due to an error.")

    print("\nThank you for using our financial advisory service.")

if __name__ == "__main__":
       username_to_query = "M. McFly"  # Replace with the desired username
       generate_financial_advice(username_to_query)

"""
def generate_graphs_and_explanations():
    products = fetch_products()

    # Graph 1: Total Spending by Product Category
    data1 = compute_total_spending_by_category(products)
    explanation1 = generate_graph_explanation(
        graph_title="Total Spending by Product Category",
        x_variable="Product Categories",
        y_variable="Total Spending",
        data=data1
    )

    # Graph 2: Total Spending by Brand
    data2 = compute_total_spending_by_brand(products)
    explanation2 = generate_graph_explanation(
        graph_title="Total Spending by Brand",
        x_variable="Product Brands",
        y_variable="Total Spending",
        data=data2
    )

    # Graph 3: Spending Distribution Across E-commerce Sites
    data3 = compute_spending_by_ecommerce_site(products)
    explanation3 = generate_graph_explanation(
        graph_title="Spending Distribution Across E-commerce Sites",
        x_variable="E-commerce Sites",
        y_variable="Total Spending",
        data=data3
    )

    # Graph 4: Average Spending per Purchase
    data4 = compute_average_spending_per_purchase(products)
    explanation4 = generate_graph_explanation(
        graph_title="Average Spending per Purchase",
        x_variable="Individual Purchases",
        y_variable="Purchase Amount",
        data={"purchase_prices": data4}
    )

    # Graph 5: Number of Purchases per Product Category
    data5 = compute_number_of_purchases_by_category(products)
    explanation5 = generate_graph_explanation(
        graph_title="Number of Purchases per Product Category",
        x_variable="Product Categories",
        y_variable="Number of Purchases",
        data=data5
    )

    # Print explanations, checking if they are not None
    print("*** Graph Explanations ***\n")
    explanations = [explanation1, explanation2, explanation3, explanation4, explanation5]
    for idx, explanation in enumerate(explanations, 1):
        if explanation:
            print(f"{idx}. {explanation.graph_title}\n{explanation.explanation}\n")
        else:
            print(f"{idx}. Explanation not available due to an error.\n")
    print("Thank you for using our financial advisory service.")

# Main function to run the analysis
def generate_summaries():
    products = fetch_products()

    # Generate category-based descriptions
    category_result = generate_product_category_descriptions(products)

    # Generate brand-based descriptions
    brand_result = generate_brand_descriptions(products)

    # Output the results
    print("*** Category-Based Analysis ***\n")
    print(category_result)
    print("\n*** Brand-Based Analysis ***\n")
    print(brand_result)
    print("\nThank you for using our financial advisory service.")
"""
