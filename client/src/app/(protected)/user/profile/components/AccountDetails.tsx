"use client";
import { useState, useRef, useEffect } from 'react';

function AccountDetails() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Select Status");
  const options = ["Active", "Suspended", "Closed"];
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(prev => !prev);
  const selectOption = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="border-2 rounded-xl p-6 bg-card">
      <div className="flex flex-col gap-0.5">
        <div className="text-2xl font-semibold">Account Details</div>
        <div className="text-sm text-gray-500">
          Manage your account information.
        </div>
      </div>
      <div className="grid gap-6 mt-12">
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="username">
            Username
          </label>
          <input
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none"
            id="username"
            defaultValue="johndoe213"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="phone">
            Phone
          </label>
          <input
            className="border-[1px] text-sm bg-card rounded-md p-2 outline-none"
            id="phone"
            defaultValue="+1 (555) 555-5555"
          />
        </div>
        <div className="grid gap-2">
          <label className="font-semibold text-sm" htmlFor="status">
            Account Status
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="w-full border-[1px] text-sm rounded-md p-2 pr-3 outline-none cursor-pointer bg-card flex justify-between items-center"
            >
              {selectedOption}
              <svg
                className="w-4 h-4 text-gray-500 ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isOpen && (
              <div className="absolute z-10 mt-1 w-full bg-card border dark:border-gray-700  border-gray-300 rounded-md shadow-lg">
                {options.map((option) => (
                  <div
                    key={option}
                    onClick={() => selectOption(option)}
                    className="cursor-pointer px-4 py-2 text-sm dark:text-gray-300 text-gray-700  hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountDetails;
