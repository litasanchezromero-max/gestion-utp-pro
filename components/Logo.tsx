
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => (
  <svg
    className={className}
    viewBox="0 0 50 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 45H40C42.7614 45 45 42.7614 45 40V10C45 7.23858 42.7614 5 40 5H10C7.23858 5 5 7.23858 5 10V40C5 42.7614 7.23858 45 10 45Z"
      className="fill-sky-100"
    />
    <path
      d="M25 10V40"
      className="stroke-sky-300"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M37 10H13C11.3431 10 10 11.3431 10 13V37C10 38.6569 11.3431 40 13 40H37C38.6569 40 40 38.6569 40 37V13C40 11.3431 38.6569 10 37 10Z"
      className="fill-[#A3DFFF] opacity-60"
    />
    <path
      d="M18 25L23 30L34 19"
      stroke="#005B8A"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
