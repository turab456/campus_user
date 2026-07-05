import type { BookCondition } from '../types';

export const CATEGORIES = [
  { id: 'books', name: 'Books', icon: 'Book' },
  { id: 'calculators', name: 'Calculators', icon: 'Calculator' },
  { id: 'electronics', name: 'Electronics', icon: 'Laptop' },
  { id: 'lab-equipment', name: 'Lab Equipment', icon: 'FlaskConical' },
  { id: 'notes', name: 'Notes', icon: 'FileText' },
  { id: 'cycles', name: 'Cycles', icon: 'Bike' },
  { id: 'hostel-essentials', name: 'Hostel Essentials', icon: 'Home' },
  { id: 'project-components', name: 'Project Components', icon: 'Cpu' },
  { id: 'stationery', name: 'Stationery', icon: 'PenTool' }
];

export const CONDITIONS: { value: BookCondition; label: string; description: string }[] = [
  { value: 'New', label: 'New', description: 'Brand new, never used, in original packaging if applicable.' },
  { value: 'Like New', label: 'Like New', description: 'Looks brand new, no visible wear, pages are completely clean.' },
  { value: 'Very Good', label: 'Very Good', description: 'Minimal wear, small creases, no notes or highlighting.' },
  { value: 'Good', label: 'Good', description: 'Average wear, minor highlighting/notes on a few pages.' },
  { value: 'Acceptable', label: 'Acceptable', description: 'Significant wear, notes/highlighting present, but completely readable.' }
];

export const COLLEGES = [
  'Indian Institute of Technology (IIT), Delhi',
  'Indian Institute of Technology (IIT), Bombay',
  'National Institute of Technology (NIT), Trichy',
  'Birla Institute of Technology and Science (BITS), Pilani',
  'RV College of Engineering (RVCE), Bangalore',
  'PES University, Bangalore',
  'Manipal Institute of Technology (MIT), Manipal',
  'Delhi Technological University (DTU), Delhi',
  'Bangalore Medical College and Research Institute (BMCRI)',
  'Kasturba Medical College (KMC), Manipal'
];

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Science & Engineering',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'MBBS',
  'BDS',
  'MBA (Finance)',
  'MBA (Marketing)',
  'BSc (Basic Sciences)',
  'BCom (Commerce)'
];

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Listed' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'condition_desc', label: 'Condition: Best First' }
];
