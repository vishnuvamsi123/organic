import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './data-source';
import { Farmer } from './entity/Farmer';
import { Product } from './entity/Product';
import { Coupon } from './entity/Coupon';

// Seed data: 4 farmers near Amalapuram (lat 16.5787, lon 82.0061)
const FARMERS = [
  { name: 'Ravi Kumar Farms', email: 'ravi@organic.com', phone: '9876543210', lat: 16.5790, lon: 82.0070, rating: 4.8, reviewCount: 240 },
  { name: 'Priya Organics', email: 'priya@organic.com', phone: '9876543211', lat: 16.5850, lon: 82.0010, rating: 4.5, reviewCount: 180 },
  { name: 'Mohan Green Farms', email: 'mohan@organic.com', phone: '9876543212', lat: 16.5680, lon: 82.0150, rating: 4.7, reviewCount: 310 },
  { name: 'Konkan Harvest Co', email: 'konkan@organic.com', phone: '9876543213', lat: 16.5750, lon: 81.9950, rating: 4.9, reviewCount: 420 },
];

const PRODUCTS = [
  // VEGETABLES (40 items)
  { name: 'Fresh Spinach (Palakura)', category: 'vegetable', basePrice: 25, unit: 'bunch', availableQty: 200, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&fit=crop', description: 'Tender organic spinach, freshly harvested. Rich in iron and vitamins.' },
  { name: 'Red Tomatoes (Tomato)', category: 'vegetable', basePrice: 30, unit: 'kg', availableQty: 300, farmerIdx: 0, imageUrl: 'https://plus.unsplash.com/premium_photo-1725467481377-413f5e6a1fe2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1595855759920-86582396756a?w=600&fit=crop', description: 'Plump, juicy organic tomatoes. Perfect for curries, salads, and chutneys.' },
  { name: 'Organic Potatoes (Bangaladumpa)', category: 'vegetable', basePrice: 40, unit: 'kg', availableQty: 500, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&fit=crop', description: 'Farm-fresh organic potatoes. Naturally grown without pesticides.' },
  { name: 'Carrots', category: 'vegetable', basePrice: 60, unit: 'kg', availableQty: 200, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&fit=crop', description: 'Sweet and crunchy baby carrots. Loaded with beta-carotene.' },
  { name: 'Fresh Cauliflower (Cauliflower)', category: 'vegetable', basePrice: 45, unit: 'piece', availableQty: 150, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1675861595435-1e3d00f8f2f5?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Green Capsicum (Capsicum)', category: 'vegetable', basePrice: 50, unit: 'kg', availableQty: 120, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1663500004095-a7482241694c?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Brinjal (Vankaya)', category: 'vegetable', basePrice: 35, unit: 'kg', availableQty: 180, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1683543122945-513029986574?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Ladies finger (Bendakaya)', category: 'vegetable', basePrice: 55, unit: 'kg', availableQty: 160, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1583830123146-248ed4a8e1e1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  { name: 'Organic Onions (Ullipaya)', category: 'vegetable', basePrice: 25, unit: 'kg', availableQty: 1000, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1723708958105-09e29205e551?q=80&w=1144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Organic Garlic (Vellulli)', category: 'vegetable', basePrice: 80, unit: '250g', availableQty: 400, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1675731118551-79b3da05a5d4?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  { name: 'Fresh Ginger (Allam)', category: 'vegetable', basePrice: 70, unit: '250g', availableQty: 300, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1603431777782-912e3b76f60d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  { name: 'Green Peas (Batani)', category: 'vegetable', basePrice: 65, unit: 'kg', availableQty: 140, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1632640110804-58827a6b37fd?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'},
  { name: 'Bitter Gourd (Kakarikaya)', category: 'vegetable', basePrice: 50, unit: 'kg', availableQty: 100, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1751374795709-5863235cfe3b?q=80&w=721&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1739903760973-4731a8e79a03?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { name: 'Bottle Gourd (Lauki)', category: 'vegetable', basePrice: 30, unit: 'piece', availableQty: 200, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1730127487636-b7fe550af030?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1601600576337-c1d8a0d1373c?w=600&fit=crop', description: 'Light and nutritious organic bottle gourd. Great for digestive health.' },
  { name: 'Ridge Gourd (Beerakaya)', category: 'vegetable', basePrice: 35, unit: 'kg', availableQty: 120, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1759156632043-eab44e007e67?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&fit=crop', description: 'Organic ridge gourd. High fibre vegetable with subtle sweet flavour.' },
  { name: 'Fresh Coriander (Kothimera)', category: 'vegetable', basePrice: 15, unit: 'bunch', availableQty: 300, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1723810315254-e189f1294bff?q=80&w=709&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1606588260160-0c4cf8dc0025?w=600&fit=crop', description: 'Aromatic fresh coriander leaves. Essential herb for Indian cooking.' },
  { name: 'Curry Leaves (Karivepaku)', category: 'vegetable', basePrice: 10, unit: 'bunch', availableQty: 400, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1663323584907-0be9317e1b92?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&fit=crop', description: 'Fresh organic curry leaves. Fragrant tempering herb for South Indian cuisine.' },
  { name: 'Drumstick (Munagakaya)', category: 'vegetable', basePrice: 40, unit: 'bunch', availableQty: 150, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1650494701391-daceb922ce9d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1600298882525-89c8cc0da8ca?w=600&fit=crop', description: 'Organic drumstick pods. Packed with vitamins and minerals.' },
  { name: 'Raw Banana (Aratikaya)', category: 'vegetable', basePrice: 35, unit: 'kg', availableQty: 180, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1780462480869-da478f4956e3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&fit=crop', description: 'Fresh organic raw bananas (Kachha Kela). Ideal for Kerala-style dishes.' },
  { name: 'Sweet Corn (Mokka Jonna)', category: 'vegetable', basePrice: 20, unit: 'piece', availableQty: 250, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1649251037566-6881b4956615?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1601593346740-925612772716?w=600&fit=crop', description: 'Crisp and sweet organic corn. Great for grilling or in salads.' },
  { name: 'Flat Beans (chikudukaya)', category: 'vegetable', basePrice: 45, unit: 'kg', availableQty: 130, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1574963835594-61eede2070dc?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=600&fit=crop', description: 'Organic cluster beans. Excellent source of fibre and protein.' },
  { name: 'Snake Gourd (Potlakaya)', category: 'vegetable', basePrice: 30, unit: 'kg', availableQty: 100, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1726996656165-7dcda461d9b2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1582515073490-39981397c445?w=600&fit=crop', description: 'Organic snake gourd. Light, cooling vegetable ideal for summer.' },
  { name: 'Sweat potato (Chilakadidumpa)', category: 'vegetable', basePrice: 55, unit: 'kg', availableQty: 80, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1730815048561-45df6f7f331d?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=600&fit=crop', description: 'Fresh organic yam. Rich in complex carbs and potassium.' },
  { name: 'Radish (Mooli)', category: 'vegetable', basePrice: 25, unit: 'kg', availableQty: 200, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1585369496137-6b539c324adc?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&fit=crop', description: 'Crisp organic radish. Excellent for parathas and salads.' },
  { name: 'Fresh Cabbage (Cabbage)', category: 'vegetable', basePrice: 35, unit: 'piece', availableQty: 180, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1652860213441-6622f9fec77f?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1592394533824-9440e5d68530?w=600&fit=crop', description: 'Crisp organic green cabbage, packed with nutrients and Vitamin C.' },
  { name: 'Mint Leaves (Pudina)', category: 'vegetable', basePrice: 12, unit: 'bunch', availableQty: 250, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1600223933926-70910c9229e2?q=80&w=532&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1603052875302-d376b7c0638a?w=600&fit=crop', description: 'Refreshing organic mint leaves, aromatic and fresh.' },
  { name: 'Green Chillies (Pachi Mirapakaya)', category: 'vegetable', basePrice: 15, unit: '250g', availableQty: 300, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1576763595295-c0371a32af78?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1588252303782-cb80119cb469?w=600&fit=crop', description: 'Spicy and fresh organic green chillies to add kick to your dishes.' },
  { name: 'Fresh Beetroot (Beetroot)', category: 'vegetable', basePrice: 40, unit: 'kg', availableQty: 220, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1663961355715-cf362778dc0e?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&fit=crop', description: 'Sweet and earthy organic beetroots, perfect for juice and salads.' },
  { name: 'Pumpkin (Kaddu)', category: 'vegetable', basePrice: 30, unit: 'kg', availableQty: 150, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1509622905150-fa66d3906e09?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1506806732259-39c2d0268443?w=600&fit=crop', description: 'Rich, orange-fleshed organic pumpkins. Great for soups and curries.' },
  { name: 'Fenugreek Leaves (Menthikoora)', category: 'vegetable', basePrice: 20, unit: 'bunch', availableQty: 190, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1588242386288-4e8456b44cc3?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&fit=crop', description: 'Nutritious fresh organic methi leaves, perfect for parathas.' },
  { name: 'Cucumber (Kheera)', category: 'vegetable', basePrice: 30, unit: 'kg', availableQty: 250, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&fit=crop', description: 'Cool and crisp organic cucumbers, grown locally.' },
  { name: 'French Beans (Sem)', category: 'vegetable', basePrice: 60, unit: 'kg', availableQty: 180, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1613728913084-090a0d106c3a?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1606757389105-64a8ee42a22f?w=600&fit=crop', description: 'Tender organic green French beans, rich in vitamins.' },
  { name: 'Ash Gourd (Bhudidha Gumadikaya)', category: 'vegetable', basePrice: 40, unit: 'kg', availableQty: 100, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1695555801863-8b1a577d5124?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1592417817098-8f3d6b206757?w=600&fit=crop', description: 'Organic ash gourd, highly cooling and nutritious.' },
  { name: 'Yellow cucumber(Dosakaya)', category: 'vegetable', basePrice: 50, unit: 'kg', availableQty: 120, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1680753863932-463cebbe5bdc?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1634495076944-39c31093b1f7?w=600&fit=crop', description: 'Fresh organic pointed gourd, traditional Indian summer vegetable.' },
  { name: 'Spring Onion (Ullikada)', category: 'vegetable', basePrice: 25, unit: 'bunch', availableQty: 200, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1667052430061-bbdce8761fc2?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1508797178974-15b35a61d121?w=600&fit=crop', description: 'Fresh organic spring onions, crisp green tops.' },

  // FRUITS (20 items)
  { name: 'Alphonso Mangoes (Mamidi Pandu)', category: 'fruit', basePrice: 350, unit: 'dozen', availableQty: 80, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&fit=crop', description: 'King of mangoes. Saffron-coloured, aromatic, and incredibly sweet.' },
  { name: 'Organic Bananas (Arati Pandu)', category: 'fruit', basePrice: 45, unit: 'dozen', availableQty: 300, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&fit=crop', description: 'Naturally ripened organic bananas. Energy-rich and naturally sweet.' },
  { name: 'Fresh Red Apples (Apple)', category: 'fruit', basePrice: 180, unit: 'kg', availableQty: 150, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&fit=crop', description: 'Crisp Himachali organic red apples. Crunchy, sweet, and bursting with vitamins.' },
  { name: 'Red Pomegranates (Danimmakaya)', category: 'fruit', basePrice: 220, unit: 'kg', availableQty: 100, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1580636521086-7b0c742dd567?w=600&fit=crop', description: 'Organic pomegranates loaded with antioxidants. Solapur premium variety.' },
  { name: 'Guava (Jamakaya)', category: 'fruit', basePrice: 60, unit: 'kg', availableQty: 200, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=600&fit=crop', description: 'Sweet and aromatic organic guavas. High in Vitamin C.' },
  { name: 'Sweet Papaya (Boppayi Pandu)', category: 'fruit', basePrice: 40, unit: 'piece', availableQty: 180, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=600&fit=crop', description: 'Ripe organic papaya. Rich in papain enzyme and Vitamin A.' },
  { name: 'Organic Pineapple (Anasa Pandu)', category: 'fruit', basePrice: 80, unit: 'piece', availableQty: 120, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=600&fit=crop', description: 'Juicy organic pineapple from Kerala. Sweet-tart tropical flavour.' },
  { name: 'Fresh Watermelon (Puchakaya)', category: 'fruit', basePrice: 25, unit: 'kg', availableQty: 400, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&fit=crop', description: 'Cool and refreshing organic watermelon. Perfect summer fruit.' },
  { name: 'Sapota (Sapotapandu)', category: 'fruit', basePrice: 70, unit: 'kg', availableQty: 100, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1699863164964-13805b27bc42?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1528826722302-d60844362f23?w=600&fit=crop', description: 'Sweet, caramel-flavoured chikoo. Rich in iron and calcium.' },
  { name: 'Coconut (Kobbarikaya)', category: 'fruit', basePrice: 35, unit: 'piece', availableQty: 500, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1603779046675-2eccbab9b982?q=80&w=733&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1507919909716-c8262e491cde?w=600&fit=crop', description: 'Tender coconuts, freshly picked. Full of natural electrolytes.' },
  { name: 'Indian Blackberry (Neredu Pandu)', category: 'fruit', basePrice: 120, unit: 'kg', availableQty: 60, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1690233319569-0ca9a8538fee?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1554795808-3231c32711cf?w=600&fit=crop', description: 'Seasonal organic jamun. Excellent for blood sugar and digestion.' },
  { name: 'Star Fruit (Kamrakh)', category: 'fruit', basePrice: 90, unit: 'kg', availableQty: 70, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1605879883262-0cd26b362f54?q=80&w=1140&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1580636521086-7b0c742dd567?w=600&fit=crop', description: 'Tangy organic star fruit. Unique star-shaped tropical fruit.' },
  { name: 'Lemon (Nimakaya)', category: 'fruit', basePrice: 30, unit: '12 pcs', availableQty: 500, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1594057689045-cbc21f5c005c?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=600&fit=crop', description: 'Juicy organic lemons. Natural Vitamin C boost for all seasons.' },
  { name: 'Custard Apple (Sitaphal)', category: 'fruit', basePrice: 150, unit: 'kg', availableQty: 50, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1680008703432-2b7c0a6a18b5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1616684000067-36952fde56ec?w=600&fit=crop', description: 'Creamy seasonal sitaphal. Rare, delicious and nutritious.' },
  { name: 'Green Apple', category: 'fruit', basePrice: 150, unit: 'kg', availableQty: 50, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1678942946279-c83e37f32304?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1616684000067-36952fde56ec?w=600&fit=crop', description: 'Creamy seasonal sitaphal. Rare, delicious and nutritious.' },
  { name: 'Dragon Fruit (Dragon Fruit)', category: 'fruit', basePrice: 280, unit: 'piece', availableQty: 40, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=600&fit=crop', description: 'Exotic organic dragon fruit. Grown in Maharashtra farms.' },
  { name: 'Amla (Usirikaya)', category: 'fruit', basePrice: 80, unit: 'kg', availableQty: 150, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1676043967557-2b70d9facd71?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1628751056238-7508cf3a7e51?w=600&fit=crop', description: 'Tart organic amla. Most potent natural Vitamin C source.' },
  { name: 'Kiwi (Kiwi)', category: 'fruit', basePrice: 200, unit: '6 pcs', availableQty: 80, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1585059895524-72359e06133a?w=600&fit=crop', description: 'Organic Himachal kiwi. Rich in Vitamin C and fibre.' },
  { name: 'Orange (Santra)', category: 'fruit', basePrice: 120, unit: 'kg', availableQty: 160, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=600&fit=crop', description: 'Sweet and juicy Nagpur oranges, rich in nutrients.' },
  { name: 'Green Grapes (Draksha)', category: 'fruit', basePrice: 90, unit: 'kg', availableQty: 240, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1660139890961-b1ea4738cf16?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1601275868399-45bec4f02c50?w=600&fit=crop', description: 'Sweet organic green grapes, seedless and crisp.' },
  { name: 'Black Grapes( Nalla Draksha)', category: 'fruit', basePrice: 80, unit: 'kg', availableQty: 200, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1578829779691-99b60bd8c7be?q=80&w=1067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1610832958506-ee563361f155?w=600&fit=crop', description: 'Juicy organic sweet lime, perfect for immune health.' },

  // RICE (10 items)
  { name: 'Organic Basmati Rice (Basmati Biyyam)', category: 'rice', basePrice: 120, unit: 'kg', availableQty: 500, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&fit=crop', description: 'Premium long-grain basmati rice. Aromatic, fluffy, and naturally aged.' },
  { name: 'Sona Masoori Rice (Sona Masoori Biyyam)', category: 'rice', basePrice: 75, unit: 'kg', availableQty: 800, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1723475158232-819e29803f4d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Light and low-calorie Sona Masoori. Favourite across South India.' },
  { name: 'Organic Brown Rice (Brown Rice Biyyam)', category: 'rice', basePrice: 95, unit: 'kg', availableQty: 400, farmerIdx: 1, imageUrl: 'https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Whole grain brown rice. High fibre, nutty flavour, diabetic-friendly.' },
  { name: 'Red Rice (Kerala)', category: 'rice', basePrice: 90, unit: 'kg', availableQty: 300, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1705338026411-00639520a438?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Traditional Kerala red rice (Matta). Earthy and nutritious.' },
  { name: 'Black Rice (Forbidden Rice)', category: 'rice', basePrice: 180, unit: 'kg', availableQty: 100, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1502825868325-37569f642e95?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1596797882870-8c33db189f72?w=600&fit=crop', description: 'Nutritious black rice. Highest antioxidant content of all rice types.' },
  { name: 'Idli Rice (Idli Biyyam)', category: 'rice', basePrice: 65, unit: 'kg', availableQty: 600, farmerIdx: 0, imageUrl: 'https://plus.unsplash.com/premium_photo-1723925093264-40b6b957c44d?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhhttps://plus.unsplash.com/premium_photo-1723925093264-40b6b957c44d?q=80&w=1024&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dttps://images.unsplash.com/photo-1605209971703-20e74beb3bec?w=600&fit=crop', description: 'Organic parboiled idli rice. Perfect texture for idli and dosa.' },
  { name: 'Kolam Rice (Kolam Biyyam)', category: 'rice', basePrice: 70, unit: 'kg', availableQty: 400, farmerIdx: 1, imageUrl: 'https://plus.unsplash.com/premium_photo-1658527064466-df8ed3bbe6e7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhtthttps://plus.unsplash.com/premium_photo-1658527064466-df8ed3bbe6e7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dps://images.unsplash.com/photo-1606413291195-b2a9a218e8a1?w=600&fit=crop', description: 'Short-grain Kolam rice from Maharashtra. Soft, aromatic everyday rice.' },
  { name: 'Chitimuthyala Rice (Chitimuthyalu Biyyam)', category: 'rice', basePrice: 140, unit: 'kg', availableQty: 80, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1613758235256-43a7bdc21d82?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhthttps://images.unsplash.com/photo-1613758235256-43a7bdc21d82?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dtps://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=600&fit=crop', description: 'Aromatic Bengali Gobindobhog rice. Short-grain fragrant variety.' },
  { name: 'Ponni Rice (Ponni Biyyam)', category: 'rice', basePrice: 80, unit: 'kg', availableQty: 350, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1704916029292-ec7b5976204c?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1606413291195-b2a9a218e8a1?w=600&fit=crop', description: 'Popular Tamil Nadu Ponni rice. Soft texture and mild aroma.' },
  // PULSES (14 items)
  { name: 'Red Lentils (Masoor Dal)', category: 'pulse', basePrice: 85, unit: 'kg', availableQty: 500, farmerIdx: 0, imageUrl: 'https://plus.unsplash.com/premium_photo-1701064865147-48dcd4d63015?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1547058881-aa0edd92aab3?w=600&fit=crop', description: 'Whole red lentils. Quick-cooking, protein-rich, and versatile.' },
  { name: 'Green Moong Dal (Pesarapappu)', category: 'pulse', basePrice: 95, unit: 'kg', availableQty: 400, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1742948557606-b02f80fa2f0c?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1612257416648-3c009e6f1ac2?w=600&fit=crop', description: 'Whole green mung beans. Excellent for sprouts and dal preparations.' },
  { name: 'Toor Dal (Kandipappu)', category: 'pulse', basePrice: 110, unit: 'kg', availableQty: 600, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1612869538502-b5baa439abd7?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1585996388902-602c3c6f859a?w=600&fit=crop', description: 'Organic toor dal. The backbone of sambar and dal tadka.' },
  { name: 'Chana Dal (Senagapappu)', category: 'pulse', basePrice: 80, unit: 'kg', availableQty: 450, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1674025748666-9ac6c8a7ab3d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&fit=crop', description: 'Split Bengal gram. Used in dals, sweets, and snacks.' },
  { name: 'Urad Dal (Minnapappu)', category: 'pulse', basePrice: 120, unit: 'kg', availableQty: 300, farmerIdx: 0, imageUrl: 'https://plus.unsplash.com/premium_photo-1670135171026-37ce1cdb5502?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://media.istockphoto.com/id/1158693674/photo/dry-organic-murad-split-matpe-beans.jpg?s=1024x1024&w=is&k=20&c=X8tHV8VCHOPeKdYTrPkCMC95LFKq2x2a7sxcjAF6mKQ=https://images.news18.com/telugu/uploads/2021/05/1622361165_udad-daal-a.jpghttps://images.news18.com/telugu/uploads/2021/05/1622361165_udad-daal-a.jpghttps://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&fit=crop', description: 'Whole black urad. Essential for idli, dosa, and makhani dal.' },
  { name: 'Rajma (Kidney Beans)', category: 'pulse', basePrice: 130, unit: 'kg', availableQty: 200, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1733562256707-c13261bfd0a9?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1561136594-7f68413baa99?w=600&fit=crop', description: 'Organic red kidney beans. Rich, hearty, and protein-packed.' },
  { name: 'Kabuli Chana (Chickpeas)', category: 'pulse', basePrice: 100, unit: 'kg', availableQty: 350, farmerIdx: 1, imageUrl: 'https://plus.unsplash.com/premium_photo-1675237624857-7d995e29897d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&fit=crop', description: 'Large Kabuli chickpeas. Ideal for chole, hummus, and salads.' },
  { name: 'Black Chana (Kala Chana)', category: 'pulse', basePrice: 90, unit: 'kg', availableQty: 280, farmerIdx: 3, imageUrl: 'https://plus.unsplash.com/premium_photo-1674025749234-9f75ffe9a8ef?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1544488243-248902143b8e?w=600&fit=crop', description: 'Desi black chickpeas. High protein and iron content.' },
  { name: 'Peanuts (Groundnuts)', category: 'pulse', basePrice: 60, unit: 'kg', availableQty: 600, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1702892989841-532ad9a93b16?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=600&fit=crop', description: 'Raw organic peanuts. Protein powerhouse used in chutneys and snacks.' },
  { name: 'Almonds (Bhadam)', category: 'pulse', basePrice: 885, unit: 'kg', availableQty: 150, farmerIdx: 2, imageUrl: 'https://plus.unsplash.com/premium_photo-1675237626334-5cf9d9d8b30c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&fit=crop', description: 'Organic moth beans. Best sprouted for usal and misal.' },
  { name: 'Cashew (jeedipappu)', category: 'pulse', basePrice: 1170, unit: 'kg', availableQty: 120, farmerIdx: 2, imageUrl: 'https://images.unsplash.com/photo-1686721635333-d71af2f1084b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&fit=crop', description: 'Traditional horse gram. High protein pulse used in South Indian cuisine.' },
  { name: 'Pumpkin seeds(Gummadi ginjalu)', category: 'pulse', basePrice: 75, unit: 'kg', availableQty: 100, farmerIdx: 1, imageUrl: 'https://plus.unsplash.com/premium_photo-1726862518740-c20771e4e832?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1518013006361-de180d130063?w=600&fit=crop', description: 'Organic field beans (Indian broad beans). Seasonal pulse from Karnataka.' },
  { name: 'Chia Seeds', category: 'pulse', basePrice: 90, unit: 'kg', availableQty: 500, farmerIdx: 3, imageUrl: 'https://images.unsplash.com/photo-1502825926876-e8819fbb2fd0?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1515543904379-3d757afe72e2?w=600&fit=crop', description: 'Split red lentils. Quick-cooking, high-protein everyday dal.' },

  // DAIRY (3 items)
  { name: 'Organic Cow Milk (Aavu Paalu)', category: 'dairy', basePrice: 35, unit: '500ml', availableQty: 150, farmerIdx: 1, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&fit=crop', description: 'Fresh, pasteurized organic cow milk. Sourced daily from pasture-raised cows.' },
  { name: 'Organic Buffalo Milk (Genumu Paalu)', category: 'dairy', basePrice: 40, unit: '500ml', availableQty: 120, farmerIdx: 0, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&fit=crop', description: 'Creamy, thick organic buffalo milk. Rich in calcium and nutrients.' },
  { name: 'Fresh Paneer (Paneer)', category: 'dairy', basePrice: 100, unit: '200g', availableQty: 80, farmerIdx: 2, imageUrl: 'https://plus.unsplash.com/premium_photo-1695044277238-6eac8969fb77?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://images.unsplash.com/photo-1589415082282-e18e38b86272?w=600&fit=crop', description: 'Soft and fresh organic paneer (cottage cheese). Made from pure farm fresh milk.' },
];

export async function seedDatabase(): Promise<void> {
  const farmerRepo = AppDataSource.getRepository(Farmer);
  const productRepo = AppDataSource.getRepository(Product);
  const couponRepo = AppDataSource.getRepository(Coupon);

  console.log('🌱 Seeding database with Indian organic products...');

  const hash = await bcrypt.hash('farmer123', 10);

  // Seed farmers
  const savedFarmers: Farmer[] = [];
  for (const fd of FARMERS) {
    let existing = await farmerRepo.findOne({ where: { email: fd.email } });
    if (existing) {
      existing.name = fd.name;
      existing.phone = fd.phone;
      existing.lat = fd.lat;
      existing.lon = fd.lon;
      existing.rating = fd.rating;
      existing.reviewCount = fd.reviewCount;
      const saved = await farmerRepo.save(existing);
      savedFarmers.push(saved);
    } else {
      const farmer = farmerRepo.create({
        ...fd,
        passwordHash: hash,
      });
      const saved = await farmerRepo.save(farmer);
      savedFarmers.push(saved);
    }
  }

  // Clean up orders and products to ensure a clean seeding state
  try {
    await AppDataSource.query('TRUNCATE TABLE "order_item" CASCADE;');
    await AppDataSource.query('TRUNCATE TABLE "order" CASCADE;');
    await AppDataSource.query('TRUNCATE TABLE "product" CASCADE;');
  } catch (err) {
    console.log('⚠️ Database truncation failed:', err);
  }

  // Seed products
  let updatedCount = 0;
  let createdCount = 0;
  for (const pd of PRODUCTS) {
    const { farmerIdx, ...rest } = pd;
    const existing = await productRepo.findOne({ where: { name: rest.name } });
    if (existing) {
      existing.category = rest.category as any;
      existing.basePrice = rest.basePrice;
      existing.unit = rest.unit;
      existing.availableQty = rest.availableQty;
      existing.imageUrl = rest.imageUrl;
      existing.description = rest.description;
      existing.farmer = savedFarmers[farmerIdx];
      await productRepo.save(existing);
      updatedCount++;
    } else {
      const product = productRepo.create({
        ...rest,
        category: rest.category as any,
        farmer: savedFarmers[farmerIdx],
      });
      await productRepo.save(product);
      createdCount++;
    }
  }

  // Seed coupon 'vamsi'
  const couponCode = 'vamsi';
  let existingCoupon = await couponRepo.findOne({ where: { code: couponCode } });
  if (existingCoupon) {
    existingCoupon.discountAmount = 100;
    existingCoupon.discountPercent = 0;
    existingCoupon.maxUses = 10000;
    existingCoupon.expiresAt = new Date('2030-01-01');
    await couponRepo.save(existingCoupon);
  } else {
    const coupon = couponRepo.create({
      code: couponCode,
      discountAmount: 100,
      discountPercent: 0,
      maxUses: 10000,
      usedCount: 0,
      expiresAt: new Date('2030-01-01'),
    });
    await couponRepo.save(coupon);
  }

  console.log(`✅ Seed complete! Updated: ${updatedCount}, Created: ${createdCount} products. Coupon 'vamsi' active.`);
}
