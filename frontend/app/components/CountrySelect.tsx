"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import styles from './CountrySelect.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Country {
  name: string;
  code: string;
  iso3: string;
  flag: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ value, onChange, placeholder = "Select a country" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        console.log("CountrySelect: Fetching from", `${API_URL}/utils/countries`);
        const response = await fetch(`${API_URL}/utils/countries`);
        if (response.ok) {
          const data = await response.json();
          console.log("CountrySelect: Loaded", data.length, "countries");
          setCountries(data);
        } else {
          console.error("CountrySelect: API error", response.status);
        }
      } catch (err) {
        console.error("CountrySelect: Network error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedCountry = countries.find(c => c.code === value);
  
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.iso3.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <div 
        className={`${styles.selector} ${isOpen ? styles.selectorActive : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.selectedContent}>
          {selectedCountry ? (
            <>
              <img src={selectedCountry.flag} alt={selectedCountry.name} className={styles.flag} />
              <span>{selectedCountry.name} ({selectedCountry.iso3})</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>
        <ChevronDown size={18} className={styles.chevron} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchWrapper}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
              <input 
                ref={searchInputRef}
                type="text"
                placeholder="Search countries..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              {searchTerm && (
                <X 
                  size={14} 
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--secondary)' }} 
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>

          <div className={styles.optionsList}>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <div 
                  key={country.code} 
                  className={`${styles.option} ${country.code === value ? styles.optionActive : ""}`}
                  onClick={() => {
                    onChange(country.code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className={styles.optionContent}>
                    <img src={country.flag} alt={country.name} className={styles.flag} />
                    <span className={styles.optionLabel}>{country.name}</span>
                  </div>
                  <span className={styles.iso3}>{country.iso3}</span>
                </div>
              ))
            ) : (
              <div className={styles.noResults}>No countries found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
