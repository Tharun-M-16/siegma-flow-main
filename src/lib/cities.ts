// Comprehensive list of ALL major Indian cities for autocomplete (500+ cities)
export const indianCities = [
  // Metro Cities
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Pune",
  
  // Major Cities (Population > 1 Million)
  "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam",
  "Vadodara", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Varanasi",
  "Aurangabad", "Amritsar", "Ranchi", "Gwalior", "Coimbatore", "Vijayawada", "Jodhpur",
  "Patna", "Thane", "Ghaziabad", "Dhanbad", "Navi Mumbai", "Allahabad", "Howrah",
  "Jabalpur", "Madurai", "Kochi", "Mysore", "Chandigarh", "Gurgaon", "Noida",
  "Raipur", "Kota", "Bhubaneswar", "Guwahati", "Dehradun", "Thiruvananthapuram",
  
  // State Capitals & Important Cities
  "Jammu", "Srinagar", "Shimla", "Panaji", "Gangtok", "Shillong", "Aizawl", "Imphal",
  "Kohima", "Agartala", "Itanagar", "Dispur", "Amaravati", "Raipur", "Daman", "Diu",
  "Silvassa", "Port Blair", "Kavaratti", "Puducherry",
  
  // Rajasthan
  "Udaipur", "Bikaner", "Ajmer", "Alwar", "Bharatpur", "Sikar", "Pali", "Tonk",
  "Kishangarh", "Beawar", "Hanumangarh", "Gangapur City", "Churu", "Jhunjhunu",
  
  // Gujarat
  "Gandhinagar", "Bhavnagar", "Jamnagar", "Junagadh", "Anand", "Mehsana", "Navsari",
  "Morbi", "Vapi", "Bharuch", "Valsad", "Surendranagar", "Porbandar", "Godhra",
  "Palanpur", "Veraval", "Dahod", "Botad", "Amreli",
  
  // Maharashtra
  "Kalyan-Dombivli", "Vasai-Virar", "Solapur", "Bhiwandi", "Amravati", "Nanded",
  "Kolhapur", "Akola", "Latur", "Dhule", "Ahmednagar", "Ichalkaranji", "Parbhani",
  "Panvel", "Yavatmal", "Achalpur", "Osmanabad", "Nandurbar", "Wardha", "Udgir",
  "Hinganghat", "Jalgaon", "Sangli", "Satara", "Miraj", "Malegaon", "Pimpri-Chinchwad",
  
  // Karnataka
  "Mangalore", "Hubli", "Belgaum", "Gulbarga", "Bellary", "Davangere", "Shimoga",
  "Tumkur", "Bijapur", "Hospet", "Hassan", "Gadag-Betigeri", "Udupi", "Robertsonpet",
  "Bhadravati", "Chitradurga", "Kolar", "Mandya", "Chikmagalur", "Gangavati",
  
  // Tamil Nadu
  "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Tirupur", "Thanjavur",
  "Vellore", "Tiruppur", "Dindigul", "Nagercoil", "Kancheepuram", "Karur", "Kumbakonam",
  "Rajapalayam", "Pudukkottai", "Hosur", "Ambur", "Nagapattinam", "Cuddalore",
  "Pollachi", "Palani", "Sivakasi", "Neyveli", "Virudhunagar", "Thoothukkudi",
  
  // Andhra Pradesh & Telangana
  "Warangal", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa",
  "Tirupati", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam",
  "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Secunderabad",
  "Nizamabad", "Khammam", "Karimnagar", "Suryapet", "Siddipet", "Miryalaguda",
  
  // Kerala
  "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram",
  "Kannur", "Tirur", "Kottayam", "Manjeri", "Thalassery", "Ponnani", "Vatakara",
  "Kanhangad", "Payyanur", "Koyilandy", "Parappanangadi", "Kalamassery", "Neyyattinkara",
  
  // West Bengal
  "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Malda", "Baharampur", "Habra",
  "Kharagpur", "Shantipur", "Dankuni", "Dhulian", "Ranaghat", "Haldia", "Raiganj",
  "Krishnanagar", "Nabadwip", "Balurghat", "Basirhat", "Bankura", "Chakdaha",
  
  // Uttar Pradesh
  "Moradabad", "Aligarh", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi",
  "Bareilly", "Muzaffarnagar", "Mathura", "Rampur", "Shahjahanpur", "Farrukhabad",
  "Maunath Bhanjan", "Hapur", "Ayodhya", "Etawah", "Mirzapur", "Bulandshahr", "Sambhal",
  "Amroha", "Hardoi", "Fatehpur", "Raebareli", "Orai", "Sitapur", "Bahraich", "Modinagar",
  "Unnao", "Jaunpur", "Lakhimpur", "Hathras", "Banda", "Pilibhit", "Barabanki",
  
  // Madhya Pradesh
  "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Murwara",
  "Singrauli", "Burhanpur", "Khandwa", "Bhind", "Chhindwara", "Guna", "Shivpuri",
  "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur",
  
  // Bihar & Jharkhand
  "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Bihar Sharif", "Arrah",
  "Begusarai", "Katihar", "Munger", "Chhapra", "Danapur", "Saharsa", "Sasaram",
  "Hajipur", "Dehri", "Siwan", "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj",
  "Jamshedpur", "Bokaro", "Ranchi", "Dhanbad", "Giridih", "Ramgarh", "Medininagar",
  "Hazaribagh", "Phusro", "Deoghar", "Chirkunda",
  
  // Odisha
  "Cuttack", "Rourkela", "Brahmapur", "Puri", "Sambalpur", "Balasore", "Bhadrak",
  "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Balangir", "Rayagada", "Bhawanipatna",
  
  // Punjab & Haryana
  "Jalandhar", "Amritsar", "Ludhiana", "Patiala", "Bathinda", "Hoshiarpur", "Mohali",
  "Pathankot", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar",
  "Faridabad", "Gurgaon", "Rohtak", "Hisar", "Panipat", "Karnal", "Sonipat",
  "Yamunanagar", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar",
  
  // Uttarakhand & Himachal Pradesh
  "Haridwar", "Dehradun", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh",
  "Shimla", "Solan", "Mandi", "Palampur", "Baddi", "Nahan", "Una", "Hamirpur",
  
  // Assam & Northeast
  "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur",
  "Bongaigaon", "Dhubri", "Diphu", "North Lakhimpur", "Karimganj", "Sivasagar",
  "Agartala", "Aizawl", "Imphal", "Kohima", "Shillong", "Itanagar", "Gangtok",
  
  // Chhattisgarh
  "Bhilai", "Korba", "Bilaspur", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur",
  "Ambikapur", "Dhamtari", "Mahasamund",
  
  // Other Important Towns
  "Tiruchirappalli", "Tirupati", "Ooty", "Darjeeling", "Pondicherry", "Nainital",
  "Mussoorie", "Mount Abu", "Lonavala", "Mahabaleshwar", "Kodaikanal", "Munnar",
  "Coorg", "Gokarna", "Hampi", "Khajuraho", "Ajanta", "Ellora", "Sanchi", "Bodh Gaya",
  "Vrindavan", "Prayagraj", "Dwarka", "Somnath", "Rameshwaram", "Kanyakumari",
  "Madikeri", "Karwar", "Manipal", "Rishikesh", "McLeod Ganj"
];

// Remove duplicates and sort
const uniqueCities = Array.from(new Set(indianCities)).sort();

// Function to filter cities based on search term
export const filterCities = (searchTerm: string, maxResults: number = 8): string[] => {
  if (!searchTerm || searchTerm.length < 2) {
    return [];
  }
  
  const lowerSearch = searchTerm.toLowerCase();
  
  // First, find cities that start with the search term
  const startsWithMatches = uniqueCities.filter(city =>
    city.toLowerCase().startsWith(lowerSearch)
  );
  
  // Then, find cities that contain the search term but don't start with it
  const containsMatches = uniqueCities.filter(city => {
    const lowerCity = city.toLowerCase();
    return lowerCity.includes(lowerSearch) && !lowerCity.startsWith(lowerSearch);
  });
  
  // Combine and limit results
  return [...startsWithMatches, ...containsMatches].slice(0, maxResults);
};
