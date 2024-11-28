# flux.ai

## Setup

1. Create a `.env` file in the root directory with the following variables:

   ```plaintext
   PORT=
   MONGODB_URI=
   URL=

2. Install dependencies
```
    npm install
    cd client
    npm install
```
3. Start 
``` 
    mkdir dbpath/db
    mongod --dbpath data/db
    npm start
    cd client
    npm start
```


## Inspiration
FLUX arose from a common frustration: the overwhelming nature of online shopping and the time spent scrolling through different e-commerce platforms. Like Doc Brown's DeLorean time machine, we wanted to create something that could help users navigate the landscape of e-commerce with precision. The name "FLUX" pays homage to the iconic Flux Capacitor while representing our mission: Financial Learning & User eXperience.

## What it does
FLUX is a chrome extension and web platform that acts as your shopping time machine. Our chrome extension tracks your e-commerce browsing patterns across multiple platforms, including Amazon, Target, EBay, and more. FLUX uses AI to analyze your shopping behavior and preferences and provides personalized product recommendations. Based on your shopping patterns, our AI is also able to provide a plan of action: a way to help you plan out your financial life in a smarter way. FLUX is user appealing: it offers a retro-futuristic dashboard that allows you to have a centralized place to view your financial habits.

## How we built it
Our tech stack embraces modern solutions while maintaining the common theme: "Back to the Future":
- Frontend: **React** with a "Back to the Future" inspired UI and a lightweight chrome extension 
- Backend: **Node.js** and **Express**
- Database: **MongoDB**
- AI/ML: **llama3-8b** with fast inference using **Groq**

## Challenges we ran into
This project was our first time building a chrome extension. We had to ensure that our extension worked consistently across different e-commerce websites due to different platforms having different structures. Along with that, we came across difficulties in syncing up all of the data points and using them as inputs into our AI for processing. We were able to utilize LangChain's structured output to help with this and solve for this challenge. Additionally, creating a custom UI and connecting it to our model's output was a keen struggle too. 

## Accomplishments that we're proud of
We were proud to have created a full functional Chrome extension that tracked a user's activity on several e-commerce platforms. We were able to implement a robust AI recommendation system that provided the user with personalized suggestions as well as a realistic plan of action for their financial stability. We designed an engaging retro-futuristic UI that made shopping experience fun and accessible. 

## What we learned
We took a deep dive into browser extension architecture, gained practical experience with LLMs and recommendation systems, created themed interfaces that were both functional and engaging, and learned how to balance out our frontend and backend needs.

## What's next for Flux
For the future of FLUX, we are thinking of adding more complex functionality in terms of more complicated financial goals, tailoring towards people's individual needs, and continuing to support more e-commerce platforms.