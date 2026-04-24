import React from 'react';
import type { House } from '../../types';
import gryffindorImg from '../../assets/gryffindor.png';
import slytherinImg from '../../assets/slytherin.png';
import ravenclawImg from '../../assets/ravenclaw.png';
import hufflepuffImg from '../../assets/hufflepuff.png';

export const HOUSE_ASSETS: Record<House, string> = {
  GRYFFINDOR: gryffindorImg,
  SLYTHERIN: slytherinImg,
  RAVENCLAW: ravenclawImg,
  HUFFLEPUFF: hufflepuffImg,
};

const HOUSES: House[] = ['GRYFFINDOR', 'SLYTHERIN', 'RAVENCLAW', 'HUFFLEPUFF'];

interface HouseSelectorProps {
  title: string;
  selectedHouse: House;
  onSelect: (house: House) => void;
}

export const HouseSelector: React.FC<HouseSelectorProps> = ({ title, selectedHouse, onSelect }) => {
  return (
    <div className="house-selection">
      <h2>{title}</h2>
      <div className="options-grid">
        {HOUSES.map((house) => (
          <div
            key={house}
            className={`option-card ${selectedHouse === house ? 'active' : ''}`}
            onClick={() => onSelect(house)}
          >
            <img src={HOUSE_ASSETS[house]} alt={house} className="house-icon" />
            <h3>{house}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
