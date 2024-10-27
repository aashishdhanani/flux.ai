import React, { useState, useEffect} from 'react';
import Sidebar from './llm.js';
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const orange = "#E4801D"
const yellow = "#F7DC11"

const ColumnChart = ({tableName, categories, numbers, color}) => {
  // Sample data for the chart
  const data = {
    labels: categories,
    datasets: [
      {
        label: tableName,
        data: numbers,
        backgroundColor: color, // Column color
        borderColor: color,
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };
  const styles = {
    width: "70%",
    height: "70%",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center", /* Centers horizontally */
    alignItems: "center",    /* Centers vertically */
    height: "100%",
  }

  return (
    <div style = {styles}> 
      <Bar data={data} options={options} />
    </div>
  );
};

const Spending = () => {

    const styles = {
      card: {
        marginTop: '30px',
        position: 'relative',
        padding: '2rem',
        height: '500px',
        background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
        borderRadius: '20px',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        overflow: 'hidden',

      },
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
        chartContainer: {
          width: "100%", // Make the container responsive
          height: "auto", // Allow height to adjust based on content
        },
      };
    
    return (
      <>
        <div style={styles.container}>
            <h2 style={styles.title}>Spending Habits</h2>
            <div style={styles.card}>
                <ColumnChart tableName = "Spending by Product Category" categories = {["Category 1", "Category 2", "Category 3", "Category 4"]} numbers = {[1, 2, 3, 4]} color = "rgba(75, 192, 192, 1)"></ColumnChart>
            </div>
            <div style={styles.card}>
                <ColumnChart tableName = "Spending by Brand" categories = {["Brand 1", "Brand 2", "Brand 3", "Brand 4"]} numbers = {[1, 2, 3, 4]} color = "rgba(75, 192, 192, 1)"></ColumnChart>
            </div>
        </div>
        <Sidebar></Sidebar>
      </>
    )
}

export default Spending;